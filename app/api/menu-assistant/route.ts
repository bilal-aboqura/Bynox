import { GoogleGenAI } from '@google/genai'
import { NextResponse } from 'next/server'
import { isLocale } from '@/i18n/config'
import { getMenuCatalogForAssistant, getMenuProduct } from '@/lib/menu-catalog'

export const runtime = 'nodejs'

type RequestBody = {
  locale: string
  message: string
  contextItemId?: string
}

const directAliases: Array<{ terms: string[]; id: string }> = [
  { terms: ['برجر كلاسيك', 'كلاسيك برجر'], id: 'classic-cheeseburger' },
  { terms: ['دبل سماش', 'سماش برجر'], id: 'double-smash-burger' },
  { terms: ['برجر دجاج', 'تشيكن برجر', 'راب دجاج', 'تشيكن راب'], id: 'crispy-chicken-burger' },
  { terms: ['بيتزا بيبروني', 'بيبروني'], id: 'pepperoni-pizza' },
  { terms: ['بيتزا مارجريتا', 'مارجريتا'], id: 'margherita-pizza' },
  { terms: ['بطاطس', 'فرايز'], id: 'french-fries' },
  { terms: ['اصابع موزاريلا', 'موزاريلا ستيكس'], id: 'mozzarella-sticks' },
  { terms: ['لاتيه كراميل', 'كراميل لاتيه'], id: 'iced-caramel-latte' },
  { terms: ['سبانيش لاتيه'], id: 'spanish-latte' },
  { terms: ['ماتشا'], id: 'iced-matcha' },
  { terms: ['موهيتو', 'موجيتو'], id: 'minu-mojito' },
  { terms: ['لاتيه مثلج', 'ايس لاتيه'], id: 'iced-latte' },
  { terms: ['كيك شوكولاتة', 'شوكولاتة كيك'], id: 'chocolate-cake' },
  { terms: ['هاني كيك', 'كيك عسل'], id: 'honey-cake' },
  { terms: ['براوني'], id: 'fudge-brownie' },
]

function normalizeArabic(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function requestedQuantity(message: string) {
  const numeric = message.match(/\b(\d{1,2})\b/)

  if (numeric) {
    return Math.max(1, Math.min(12, Number(numeric[1])))
  }

  if (/برجرين|بيتزتين|اتنين|اثنين|٢/.test(message)) return 2
  if (/تلاته|ثلاثه|٣/.test(message)) return 3
  if (/اربعه|اربعة|٤/.test(message)) return 4
  return 1
}

function findDirectItemIds(normalized: string) {
  const matched = directAliases
    .filter((alias) =>
      alias.terms.some((term) => normalized.includes(normalizeArabic(term))),
    )
    .map((alias) => alias.id)

  if (matched.length === 0 && /برجر/.test(normalized)) {
    matched.push('classic-cheeseburger')
  }

  if (matched.length === 0 && /بيتزا/.test(normalized)) {
    matched.push('pepperoni-pizza')
  }

  return [...new Set(matched)]
}

function parseDirectOrder(message: string, contextItemId?: string) {
  const normalized = normalizeArabic(message)
  const hasOrderIntent =
    /(^|\s)(ضيف|ضيفه|ضيفيه|اضف|حط|حطي|حطه|حطيه|عايز|عاوز|اريد|اطلب|هات|هاته|هاتيه|هاتلي|محتاج)(\s|$)/.test(
      normalized,
    ) || /برجرين|بيتزتين/.test(normalized)

  if (!hasOrderIntent) {
    return []
  }

  const quantity = requestedQuantity(normalized)
  const itemIds = findDirectItemIds(normalized)

  if (itemIds.length === 0 && contextItemId && getMenuProduct(contextItemId)) {
    itemIds.push(contextItemId)
  }

  return itemIds.map((id) => ({ id, quantity }))
}

function parseDirectShow(message: string) {
  const normalized = normalizeArabic(message)
  const hasShowIntent =
    /(^|\s)(وريني|افتح|افتحي|اعرض|اعرضي|شوف|خليني|تفاصيل|مكونات)(\s|$)/.test(
      normalized,
    ) || /عايز اشوف|عاوز اشوف|عايز تفاصيل|عاوز تفاصيل/.test(normalized)

  if (!hasShowIntent) {
    return ''
  }

  return findDirectItemIds(normalized)[0] || ''
}

function parseDirectOpenCart(message: string) {
  const normalized = normalizeArabic(message)
  const mentionsCart = /(^|\s)(السله|سله|الكارت|كارت|العربه|عربه)(\s|$)/.test(
    normalized,
  )
  const hasOpenIntent =
    /(^|\s)(وريني|افتح|افتحي|اعرض|اعرضي|شوف|راجع|راجعي)(\s|$)/.test(
      normalized,
    ) || /عايز اشوف|عاوز اشوف|حسابي كام|الطلب بتاعي/.test(normalized)

  return mentionsCart && hasOpenIntent
}

function parseDirectRemove(message: string, contextItemId?: string) {
  const normalized = normalizeArabic(message)
  const hasRemoveIntent =
    /(^|\s)(امسح|امسحي|شيل|شيلي|شيله|شيليه|احذف|احذفي|الغي|الغيه|لغي|لغيه|طلع|طلعي)(\s|$)/.test(
      normalized,
    ) || /من السله|من الكارت/.test(normalized)

  if (!hasRemoveIntent) {
    return []
  }

  const itemIds = findDirectItemIds(normalized)
  if (itemIds.length === 0 && contextItemId && getMenuProduct(contextItemId)) {
    itemIds.push(contextItemId)
  }

  const hasExplicitQuantity =
    /\b\d{1,2}\b|[١٢٣٤٥٦٧٨٩]|واحد|واحده|اتنين|اثنين|تلاته|ثلاثه|اربعه|اربعة/.test(
      normalized,
    )

  return itemIds.map((id) => ({
    id,
    quantity: requestedQuantity(normalized),
    removeAll: !hasExplicitQuantity,
  }))
}

const responseSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    reply: { type: 'string' },
    items: {
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
    showItemId: { type: 'string' },
    openCart: { type: 'boolean' },
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
  },
  required: ['reply', 'items', 'showItemId', 'openCart', 'removeItems'],
} as const

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing GEMINI_API_KEY on the server.' },
        { status: 500 },
      )
    }

    const body = (await request.json()) as RequestBody

    if (!isLocale(body.locale) || !body.message?.trim()) {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
    }

    const directRemoveItems = parseDirectRemove(
      body.message,
      body.contextItemId,
    ).filter((item) => Boolean(getMenuProduct(item.id)))

    if (directRemoveItems.length > 0) {
      return NextResponse.json({
        reply:
          body.locale === 'ar'
            ? 'حاضر، هشيله من السلة قدامك دلوقتي.'
            : 'Sure — I’m removing it from your cart now.',
        items: [],
        showItemId: '',
        openCart: false,
        removeItems: directRemoveItems,
      })
    }

    if (parseDirectOpenCart(body.message)) {
      return NextResponse.json({
        reply:
          body.locale === 'ar'
            ? 'حاضر، هفتحلك السلة قدامك دلوقتي.'
            : 'Sure — I’m opening your cart now.',
        items: [],
        showItemId: '',
        openCart: true,
        removeItems: [],
      })
    }

    const directItems = parseDirectOrder(body.message, body.contextItemId).filter((item) =>
      Boolean(getMenuProduct(item.id)),
    )

    if (directItems.length > 0) {
      const itemNames = directItems
        .map((item) => getMenuProduct(item.id)?.nameAr)
        .filter(Boolean)
        .join(' و')

      return NextResponse.json({
        reply:
          body.locale === 'ar'
            ? `من عيني، لقيت ${itemNames} وبضيفه للسلة قدامك.`
            : 'Found it — I’m adding it to your cart now.',
        items: directItems,
        showItemId: '',
        openCart: false,
        removeItems: [],
      })
    }

    const directShowItemId = parseDirectShow(body.message)
    const directShowProduct = directShowItemId
      ? getMenuProduct(directShowItemId)
      : undefined

    if (directShowProduct) {
      return NextResponse.json({
        reply:
          body.locale === 'ar'
            ? `أكيد، هفتحلك تفاصيل ${directShowProduct.nameAr} قدامك دلوقتي.`
            : `Sure — I’m opening ${directShowProduct.nameEn} now.`,
        items: [],
        showItemId: directShowProduct.id,
        openCart: false,
        removeItems: [],
      })
    }

    const client = new GoogleGenAI({ apiKey })
    const catalog = getMenuCatalogForAssistant()
    const isArabic = body.locale === 'ar'
    const response = await client.models.generateContent({
      model: process.env.GEMINI_TEXT_MODEL || 'gemini-3.5-flash',
      contents: body.message.trim(),
      config: {
        systemInstruction: [
          'You are Minu, the warm female voice of the MinuHub smart menu.',
          isArabic
            ? 'Reply in concise, genuinely conversational Egyptian Arabic. Sound like a friendly Egyptian woman helping someone order in person, never like a bot or call center.'
            : 'Reply in concise friendly English.',
          'Understand the order using only the catalog below.',
          'Return requested items only when the user clearly asks to add/order them.',
          'When the user asks to show, open, see, or view details for one specific item, return its exact id in showItemId. Otherwise return an empty string.',
          'When the user asks to see, open, or review their cart or basket, set openCart to true. Otherwise set it to false. Never just say the cart is visible.',
          'When the user asks to remove an item from the cart, return it in removeItems and do not return it in items. If no quantity is stated set removeAll true; otherwise set removeAll false and use the exact quantity. Use the contextItemId for a clear reference like شيله or remove it.',
          'If the user asks for a recommendation without ordering, return an empty items array and recommend at most two options.',
          'If quantity is omitted, use 1. Never invent ids, items, prices, or offers.',
          `CATALOG: ${JSON.stringify(catalog)}`,
        ].join('\n'),
        responseMimeType: 'application/json',
        responseJsonSchema: responseSchema,
      },
    })

    const parsed = JSON.parse(response.text || '{}') as {
      reply?: string
      items?: Array<{ id?: string; quantity?: number }>
      showItemId?: string
      openCart?: boolean
      removeItems?: Array<{
        id?: string
        quantity?: number
        removeAll?: boolean
      }>
    }
    const items = (parsed.items || [])
      .filter((item) => item.id && getMenuProduct(item.id))
      .map((item) => ({
        id: item.id as string,
        quantity: Math.max(1, Math.min(12, Number(item.quantity) || 1)),
      }))
    const removeItems = (parsed.removeItems || [])
      .filter((item) => item.id && getMenuProduct(item.id))
      .map((item) => ({
        id: item.id as string,
        quantity: Math.max(1, Math.min(12, Number(item.quantity) || 1)),
        removeAll: Boolean(item.removeAll),
      }))

    return NextResponse.json({
      reply:
        parsed.reply ||
        (isArabic ? 'قولّي تحب أضيف لك إيه؟' : 'What would you like me to add?'),
      items,
      showItemId:
        parsed.showItemId && getMenuProduct(parsed.showItemId)
          ? parsed.showItemId
          : '',
      openCart: Boolean(parsed.openCart),
      removeItems,
    })
  } catch (error) {
    console.error('Menu assistant route error', error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to process the menu request.',
      },
      { status: 500 },
    )
  }
}
