import OpenAI from 'openai'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const realtimeModel = process.env.OPENAI_REALTIME_MODEL || 'gpt-realtime-2.1'

export async function POST() {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'Missing OPENAI_API_KEY on the server.' },
        { status: 500 },
      )
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const secret = await client.realtime.clientSecrets.create({
      session: {
        type: 'realtime',
        model: realtimeModel,
        audio: {
          input: {
            turn_detection: {
              type: 'server_vad',
              create_response: true,
              interrupt_response: true,
            },
          },
          output: {
            voice: 'marin',
          },
        },
      },
      expires_after: {
        anchor: 'created_at',
        seconds: 600,
      },
    })

    return NextResponse.json({
      clientSecret: secret.value,
      expiresAt: secret.expires_at,
    })
  } catch (error) {
    console.error('Realtime session route error', error)

    const message =
      error instanceof Error
        ? error.message
        : 'Failed to create a realtime session.'

    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 },
    )
  }
}
