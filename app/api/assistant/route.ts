import { NextResponse } from 'next/server'
import { isLocale } from '@/i18n/config'
import { generateAssistantReply } from '@/lib/gemini-assistant'

export const runtime = 'nodejs'

type RequestBody = {
  locale: string
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
}

export async function POST(request: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Missing GEMINI_API_KEY on the server.' },
        { status: 500 },
      )
    }

    const body = (await request.json()) as RequestBody

    if (
      !isLocale(body.locale) ||
      !Array.isArray(body.messages) ||
      body.messages.length === 0
    ) {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
    }

    const trimmedMessages = body.messages
      .filter((message) => message.content.trim().length > 0)
      .slice(-12)

    if (trimmedMessages.length === 0) {
      return NextResponse.json({ error: 'No messages provided.' }, { status: 400 })
    }

    return NextResponse.json({
      reply: await generateAssistantReply(body.locale, trimmedMessages),
    })
  } catch (error) {
    console.error('Assistant route error', error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate an assistant response.',
      },
      { status: 500 },
    )
  }
}
