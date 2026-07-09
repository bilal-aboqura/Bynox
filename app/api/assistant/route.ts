import { run } from '@openai/agents'
import { NextResponse } from 'next/server'
import type { AgentInputItem } from '@openai/agents'
import { isLocale } from '@/i18n/config'
import { createCafeTextAgent } from '@/lib/server-assistant'

export const runtime = 'nodejs'

type RequestBody = {
  locale: string
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
}

function toAgentHistory(
  messages: RequestBody['messages'],
): AgentInputItem[] {
  return messages.map((message) => {
    if (message.role === 'assistant') {
      return {
        role: 'assistant',
        status: 'completed',
        content: [{ type: 'output_text', text: message.content }],
      }
    }

    return {
      role: 'user',
      content: [{ type: 'input_text', text: message.content }],
    }
  })
}

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'Missing OPENAI_API_KEY on the server.' },
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

    const result = await run(
      createCafeTextAgent(body.locale),
      toAgentHistory(trimmedMessages),
    )

    return NextResponse.json({
      reply: result.finalOutput || 'I am here to help.',
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
