import { GoogleGenAI } from '@google/genai'
import {
  getMenuCatalogForAssistant,
  getMenuProduct,
} from '@/lib/menu-catalog'

type ConversationMessage = {
  role: 'user' | 'model'
  text: string
}

type CartLine = {
  id: string
  quantity: number
}

type WhatsAppSession = {
  messages: ConversationMessage[]
  cart: Map<string, number>
  updatedAt: number
}

type AudioInput = {
  data: string
  mimeType: string
}

type AgentInput =
  | { kind: 'text'; text: string }
  | { kind: 'audio'; audio: AudioInput }

type AgentDecision = {
  reply?: string
  understoodText?: string
  addItems?: Array<{ id?: string; quantity?: number }>
  removeItems?: Array<{
    id?: string
    quantity?: number
    removeAll?: boolean
  }>
  showCart?: boolean
  deleteData?: boolean
}

const SESSION_TTL_MS = 6 * 60 * 60 * 1000
const MAX_SESSIONS = 200
const sessions = new Map<string, WhatsAppSession>()

const responseSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    reply: { type: 'string' },
    understoodText: { type: 'string' },
    addItems: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          id: { type: 'string' },
          quantity: { type: 'integer', minimum: 1, maximum: 12 },
        },
        required: ['id', 'quantity'],
      },
    },
    removeItems: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          id: { type: 'string' },
          quantity: { type: 'integer', minimum: 1, maximum: 12 },
          removeAll: { type: 'boolean' },
        },
        required: ['id', 'quantity', 'removeAll'],
      },
    },
    showCart: { type: 'boolean' },
    deleteData: { type: 'boolean' },
  },
  required: [
    'reply',
    'understoodText',
    'addItems',
    'removeItems',
    'showCart',
    'deleteData',
  ],
} as const

function isDirectDeletionRequest(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')

  return (
    normalized === 'delete my data' ||
    normalized === 'احذف بياناتي' ||
    normalized === 'امسح بياناتي'
  )
}

function cleanupSessions() {
  const cutoff = Date.now() - SESSION_TTL_MS

  for (const [sender, session] of sessions) {
    if (session.updatedAt < cutoff) {
      sessions.delete(sender)
    }
  }

  while (sessions.size >= MAX_SESSIONS) {
    const oldest = sessions.keys().next().value as string | undefined
    if (!oldest) break
    sessions.delete(oldest)
  }
}

function getSession(sender: string) {
  cleanupSessions()
  const existing = sessions.get(sender)

  if (existing) {
    existing.updatedAt = Date.now()
    sessions.delete(sender)
    sessions.set(sender, existing)
    return existing
  }

  const created: WhatsAppSession = {
    messages: [],
    cart: new Map(),
    updatedAt: Date.now(),
  }
  sessions.set(sender, created)
  return created
}

function cartLines(session: WhatsAppSession): CartLine[] {
  return [...session.cart.entries()].map(([id, quantity]) => ({ id, quantity }))
}

function formatCart(session: WhatsAppSession) {
  const lines = cartLines(session)

  if (lines.length === 0) {
    return 'سلتك لسه فاضية. قوليلي تحبي نضيف إيه؟'
  }

  const rendered = lines
    .map(({ id, quantity }) => {
      const product = getMenuProduct(id)
      return product
        ? `• ${quantity} × ${product.nameAr} — ${product.price * quantity} جنيه`
        : ''
    })
    .filter(Boolean)
  const total = lines.reduce((sum, { id, quantity }) => {
    return sum + (getMenuProduct(id)?.price || 0) * quantity
  }, 0)

  return `سلتك دلوقتي:\n${rendered.join('\n')}\nالإجمالي: ${total} جنيه.`
}

function buildWhatsAppInstructions(session: WhatsAppSession) {
  return [
    'أنتِ Minu، مساعدة MinuHub على واتساب. شخصيتك بنت مصرية ودودة، هادية وطبيعية.',
    'ردّي بالمصري وباختصار، جملة أو جملتين عادةً. من غير Markdown تقيل ومن غير ما تقولي إنك روبوت.',
    'استخدمي الكتالوج فقط. ممنوع اختراع أصناف أو أسعار أو عروض.',
    'لو العميل طلب إضافة صنف، ضعيه في addItems بالكمية. لو الكمية مش مذكورة استخدمي 1.',
    'لو طلب حذف صنف، ضعيه في removeItems. removeAll=true لو لم يحدد كمية.',
    'لو طلب يشوف السلة أو الحساب، اجعلي showCart=true.',
    'لو طلب حذف بياناته أو مسح بياناته، اجعلي deleteData=true ولا تنفذي أي إجراء آخر.',
    'لا تقولي إنك أضفتِ أو حذفتِ قبل وضع الإجراء الصحيح في JSON.',
    'لو الرسالة فويس، اكتبي ما فهمتيه باختصار في understoodText ثم نفذي الطلب نفسه.',
    'لو الرسالة نص، ضعي النص نفسه تقريبًا في understoodText.',
    'السلة هنا تخص محادثة واتساب التجريبية، وليست سلة صفحة الويب المفتوحة على جهاز آخر.',
    `CATALOG: ${JSON.stringify(getMenuCatalogForAssistant())}`,
    `CURRENT_CART: ${JSON.stringify(cartLines(session))}`,
  ].join('\n')
}

function applyDecision(session: WhatsAppSession, decision: AgentDecision) {
  for (const item of decision.addItems || []) {
    if (!item.id || !getMenuProduct(item.id)) continue
    const quantity = Math.max(1, Math.min(12, Number(item.quantity) || 1))
    session.cart.set(item.id, (session.cart.get(item.id) || 0) + quantity)
  }

  for (const item of decision.removeItems || []) {
    if (!item.id || !getMenuProduct(item.id)) continue
    const current = session.cart.get(item.id) || 0

    if (item.removeAll || current <= 0) {
      session.cart.delete(item.id)
      continue
    }

    const quantity = Math.max(1, Math.min(12, Number(item.quantity) || 1))
    const next = current - quantity

    if (next > 0) session.cart.set(item.id, next)
    else session.cart.delete(item.id)
  }
}

export async function replyToWhatsAppGuest(sender: string, input: AgentInput) {
  const apiKey = process.env.GEMINI_API_KEY?.trim()

  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY on the server.')
  }

  if (input.kind === 'text' && isDirectDeletionRequest(input.text)) {
    sessions.delete(sender)
    return 'تم حذف سياق المحادثة والسلة المؤقتين من MinuHub.'
  }

  const session = getSession(sender)
  const client = new GoogleGenAI({ apiKey })
  const currentUserParts =
    input.kind === 'text'
      ? [{ text: input.text.trim() }]
      : [
          {
            text: 'دي رسالة صوتية من العميل. افهميها ونفذي طلبه وردّي عليه بالمصري.',
          },
          {
            inlineData: {
              data: input.audio.data,
              mimeType: input.audio.mimeType,
            },
          },
        ]
  const response = await client.models.generateContent({
    model:
      process.env.GEMINI_WHATSAPP_MODEL ||
      process.env.GEMINI_TEXT_MODEL ||
      'gemini-3.5-flash',
    contents: [
      ...session.messages.slice(-10).map((message) => ({
        role: message.role,
        parts: [{ text: message.text }],
      })),
      { role: 'user', parts: currentUserParts },
    ],
    config: {
      systemInstruction: buildWhatsAppInstructions(session),
      responseMimeType: 'application/json',
      responseJsonSchema: responseSchema,
    },
  })
  const decision = JSON.parse(response.text || '{}') as AgentDecision

  if (decision.deleteData) {
    sessions.delete(sender)
    return 'تم حذف سياق المحادثة والسلة المؤقتين من MinuHub.'
  }

  applyDecision(session, decision)

  const understoodText =
    decision.understoodText?.trim() ||
    (input.kind === 'text' ? input.text.trim() : 'رسالة صوتية')
  const reply = decision.showCart
    ? formatCart(session)
    : decision.reply?.trim() || 'أنا معاكي، قوليلي تحبي تطلبي إيه؟'

  session.messages.push(
    { role: 'user', text: understoodText.slice(0, 1_500) },
    { role: 'model', text: reply.slice(0, 1_500) },
  )
  session.messages = session.messages.slice(-12)
  session.updatedAt = Date.now()

  return reply
}
