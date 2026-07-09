import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const realtimeModel = process.env.OPENAI_REALTIME_MODEL || 'gpt-realtime-2.1'

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'Missing OPENAI_API_KEY on the server.' },
        { status: 500 },
      )
    }

    const sdp = await request.text()

    if (!sdp.trim()) {
      return NextResponse.json(
        { error: 'Missing SDP offer in request body.' },
        { status: 400 },
      )
    }

    const formData = new FormData()
    formData.set('sdp', sdp)
    formData.set(
      'session',
      JSON.stringify({
        type: 'realtime',
        model: realtimeModel,
        audio: {
          output: {
            voice: 'marin',
          },
        },
      }),
    )

    const response = await fetch('https://api.openai.com/v1/realtime/calls', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData,
    })

    const responseText = await response.text()

    if (!response.ok) {
      console.error('Realtime call route error payload', responseText)

      return NextResponse.json(
        {
          error: 'Failed to establish a realtime call.',
          details: responseText,
        },
        { status: response.status },
      )
    }

    return new Response(responseText, {
      status: 200,
      headers: {
        'Content-Type': 'application/sdp',
      },
    })
  } catch (error) {
    console.error('Realtime call route error', error)

    return NextResponse.json(
      { error: 'Failed to create a realtime WebRTC session.' },
      { status: 500 },
    )
  }
}
