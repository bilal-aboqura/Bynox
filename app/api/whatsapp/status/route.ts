import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  const configured = {
    accessToken: Boolean(process.env.WHATSAPP_ACCESS_TOKEN?.trim()),
    phoneNumberId: Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID?.trim()),
    graphApiVersion: Boolean(process.env.WHATSAPP_GRAPH_API_VERSION?.trim()),
    verifyToken: Boolean(process.env.WHATSAPP_VERIFY_TOKEN?.trim()),
    appSecret: Boolean(process.env.META_APP_SECRET?.trim()),
    testRecipient: Boolean(process.env.WHATSAPP_TEST_RECIPIENT?.trim()),
    geminiApiKey: Boolean(process.env.GEMINI_API_KEY?.trim()),
  }

  return NextResponse.json({
    ready: Object.values(configured).every(Boolean),
    configured,
    callbackPath: '/api/whatsapp/webhook',
    supportedInboundMessages: ['text', 'audio'],
  })
}

