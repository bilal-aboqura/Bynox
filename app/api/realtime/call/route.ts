import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

/**
 * Kept as a small compatibility response for deployments that still have an
 * older route manifest. Voice sessions now connect directly to Gemini Live
 * with the short-lived token from /api/realtime/session.
 */
export async function POST() {
  return NextResponse.json(
    { error: 'This realtime transport has moved to Gemini Live.' },
    { status: 410 },
  )
}
