import { after } from 'next/server'
import { NextResponse } from 'next/server'
import {
  downloadWhatsAppAudio,
  markWhatsAppMessageRead,
  normalizeWhatsAppNumber,
  sendWhatsAppText,
  verifyMetaWebhookSignature,
} from '@/lib/whatsapp-cloud'
import { replyToWhatsAppGuest } from '@/lib/whatsapp-agent'

export const runtime = 'nodejs'

type WhatsAppMessage = {
  from?: string
  id?: string
  type?: string
  text?: { body?: string }
  audio?: { id?: string }
}

type WhatsAppWebhook = {
  object?: string
  entry?: Array<{
    changes?: Array<{
      field?: string
      value?: { messages?: WhatsAppMessage[] }
    }>
  }>
}

const MESSAGE_TTL_MS = 24 * 60 * 60 * 1000
const claimedMessages = new Map<string, number>()

function claimMessage(messageId: string) {
  const cutoff = Date.now() - MESSAGE_TTL_MS

  for (const [id, timestamp] of claimedMessages) {
    if (timestamp < cutoff) claimedMessages.delete(id)
  }

  if (claimedMessages.has(messageId)) return false
  claimedMessages.set(messageId, Date.now())
  return true
}

function extractMessages(payload: WhatsAppWebhook) {
  return (payload.entry || []).flatMap((entry) =>
    (entry.changes || []).flatMap((change) => change.value?.messages || []),
  )
}

function isAllowedDemoRecipient(sender: string) {
  const configured = process.env.WHATSAPP_TEST_RECIPIENT?.trim()
  return (
    Boolean(configured) &&
    normalizeWhatsAppNumber(sender) === normalizeWhatsAppNumber(configured || '')
  )
}

async function processMessage(message: WhatsAppMessage) {
  if (!message.id || !message.from || !claimMessage(message.id)) return

  try {
    if (!isAllowedDemoRecipient(message.from)) return

    markWhatsAppMessageRead(message.id).catch(() => undefined)

    let reply: string

    if (message.type === 'text' && message.text?.body?.trim()) {
      reply = await replyToWhatsAppGuest(message.from, {
        kind: 'text',
        text: message.text.body,
      })
    } else if (message.type === 'audio' && message.audio?.id) {
      const audio = await downloadWhatsAppAudio(message.audio.id)
      reply = await replyToWhatsAppGuest(message.from, {
        kind: 'audio',
        audio,
      })
    } else {
      reply = 'حالياً أقدر أفهم رسالة مكتوبة أو فويس. ابعتيلي طلبك بأي واحدة فيهم.'
    }

    await sendWhatsAppText(message.from, reply, message.id)
  } catch (error) {
    claimedMessages.delete(message.id)
    console.error(
      'WhatsApp message processing failed:',
      error instanceof Error ? error.message : 'Unknown error',
    )
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const mode = url.searchParams.get('hub.mode')
  const token = url.searchParams.get('hub.verify_token')
  const challenge = url.searchParams.get('hub.challenge')
  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN?.trim()

  if (
    mode === 'subscribe' &&
    expectedToken &&
    token === expectedToken &&
    challenge
  ) {
    return new Response(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    })
  }

  return new Response('Webhook verification failed.', { status: 403 })
}

export async function POST(request: Request) {
  const rawBody = await request.text()

  if (
    !verifyMetaWebhookSignature(
      rawBody,
      request.headers.get('x-hub-signature-256'),
    )
  ) {
    return new Response('Invalid webhook signature.', { status: 401 })
  }

  let payload: WhatsAppWebhook

  try {
    payload = JSON.parse(rawBody) as WhatsAppWebhook
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 })
  }

  if (payload.object !== 'whatsapp_business_account') {
    return NextResponse.json({ received: true })
  }

  const messages = extractMessages(payload)
  after(async () => {
    await Promise.all(messages.map(processMessage))
  })

  return NextResponse.json({ received: true })
}

