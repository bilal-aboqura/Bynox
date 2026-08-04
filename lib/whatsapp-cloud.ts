import { createHmac, timingSafeEqual } from 'node:crypto'

const WHATSAPP_TEXT_LIMIT = 3_500
const WHATSAPP_AUDIO_LIMIT_BYTES = 20 * 1024 * 1024

type WhatsAppMediaMetadata = {
  url?: string
  mime_type?: string
  file_size?: number
}

function requiredEnvironmentValue(name: string) {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`Missing ${name} on the server.`)
  }

  return value
}

function graphApiUrl(path: string) {
  const version = requiredEnvironmentValue('WHATSAPP_GRAPH_API_VERSION')
  return `https://graph.facebook.com/${version}/${path.replace(/^\//, '')}`
}

function authorizationHeaders() {
  return {
    Authorization: `Bearer ${requiredEnvironmentValue('WHATSAPP_ACCESS_TOKEN')}`,
  }
}

async function parseMetaError(response: Response) {
  try {
    const payload = (await response.json()) as {
      error?: { message?: string; code?: number }
    }
    const code = payload.error?.code ? ` (${payload.error.code})` : ''
    return `${payload.error?.message || 'Meta request failed'}${code}`
  } catch {
    return `Meta request failed with status ${response.status}`
  }
}

export function normalizeWhatsAppNumber(value: string) {
  return value.replace(/\D/g, '')
}

export function verifyMetaWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
) {
  const appSecret = process.env.META_APP_SECRET?.trim()

  if (!appSecret || !signatureHeader?.startsWith('sha256=')) {
    return false
  }

  const received = signatureHeader.slice('sha256='.length)
  const expected = createHmac('sha256', appSecret)
    .update(rawBody, 'utf8')
    .digest('hex')

  if (received.length !== expected.length) {
    return false
  }

  return timingSafeEqual(Buffer.from(received), Buffer.from(expected))
}

export async function sendWhatsAppText(
  recipient: string,
  body: string,
  replyToMessageId?: string,
) {
  const phoneNumberId = requiredEnvironmentValue('WHATSAPP_PHONE_NUMBER_ID')
  const text = body.trim().slice(0, WHATSAPP_TEXT_LIMIT)
  const response = await fetch(graphApiUrl(`${phoneNumberId}/messages`), {
    method: 'POST',
    headers: {
      ...authorizationHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: normalizeWhatsAppNumber(recipient),
      ...(replyToMessageId
        ? { context: { message_id: replyToMessageId } }
        : {}),
      type: 'text',
      text: {
        preview_url: false,
        body: text || 'أنا معاكي، قوليلي تحبي تطلبي إيه؟',
      },
    }),
  })

  if (!response.ok) {
    throw new Error(await parseMetaError(response))
  }
}

export function getPublicWhatsAppAssetUrl(pathname: string) {
  const configured = process.env.WHATSAPP_PUBLIC_BASE_URL?.trim()
  const vercelHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_URL?.trim()
  const base = configured || (vercelHost ? `https://${vercelHost}` : '')

  if (!base) {
    throw new Error('Missing WHATSAPP_PUBLIC_BASE_URL on the server.')
  }

  return new URL(pathname, `${base.replace(/\/$/, '')}/`).toString()
}

export async function sendWhatsAppImage(
  recipient: string,
  imageUrl: string,
  caption: string,
) {
  const phoneNumberId = requiredEnvironmentValue('WHATSAPP_PHONE_NUMBER_ID')
  const response = await fetch(graphApiUrl(`${phoneNumberId}/messages`), {
    method: 'POST',
    headers: {
      ...authorizationHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: normalizeWhatsAppNumber(recipient),
      type: 'image',
      image: {
        link: imageUrl,
        caption: caption.trim().slice(0, 1_000),
      },
    }),
  })

  if (!response.ok) {
    throw new Error(await parseMetaError(response))
  }
}

export async function markWhatsAppMessageRead(messageId: string) {
  const phoneNumberId = requiredEnvironmentValue('WHATSAPP_PHONE_NUMBER_ID')
  const response = await fetch(graphApiUrl(`${phoneNumberId}/messages`), {
    method: 'POST',
    headers: {
      ...authorizationHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
      typing_indicator: { type: 'text' },
    }),
  })

  if (!response.ok) {
    throw new Error(await parseMetaError(response))
  }
}

export async function downloadWhatsAppAudio(mediaId: string) {
  const metadataResponse = await fetch(graphApiUrl(mediaId), {
    headers: authorizationHeaders(),
  })

  if (!metadataResponse.ok) {
    throw new Error(await parseMetaError(metadataResponse))
  }

  const metadata = (await metadataResponse.json()) as WhatsAppMediaMetadata

  if (!metadata.url || !metadata.mime_type?.startsWith('audio/')) {
    throw new Error('The WhatsApp media is not a supported audio file.')
  }

  if (
    typeof metadata.file_size === 'number' &&
    metadata.file_size > WHATSAPP_AUDIO_LIMIT_BYTES
  ) {
    throw new Error('The WhatsApp voice note is larger than 20 MB.')
  }

  const mediaResponse = await fetch(metadata.url, {
    headers: authorizationHeaders(),
  })

  if (!mediaResponse.ok) {
    throw new Error(await parseMetaError(mediaResponse))
  }

  const bytes = await mediaResponse.arrayBuffer()

  if (bytes.byteLength > WHATSAPP_AUDIO_LIMIT_BYTES) {
    throw new Error('The WhatsApp voice note is larger than 20 MB.')
  }

  return {
    data: Buffer.from(bytes).toString('base64'),
    mimeType: metadata.mime_type,
  }
}
