import { GoogleGenAI, Modality, ThinkingLevel } from '@google/genai'
import { NextResponse } from 'next/server'
import { buildAssistantInstructions } from '@/lib/cafe-knowledge'
import { bookingFunctionDeclaration } from '@/lib/gemini-assistant'
import { websiteControlFunctionDeclarations } from '@/lib/website-control'

export const runtime = 'nodejs'

const liveModel =
  process.env.GEMINI_LIVE_MODEL || 'gemini-3.1-flash-live-preview'

export async function POST() {
  try {
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing GEMINI_API_KEY on the server.' },
        { status: 500 },
      )
    }

    const now = Date.now()
    const client = new GoogleGenAI({
      apiKey,
      httpOptions: { apiVersion: 'v1alpha' },
    })
    const token = await client.authTokens.create({
      config: {
        // One browser connection per token keeps a leaked token narrowly scoped.
        uses: 1,
        expireTime: new Date(now + 30 * 60 * 1000).toISOString(),
        newSessionExpireTime: new Date(now + 60 * 1000).toISOString(),
        liveConnectConstraints: {
          model: liveModel,
          config: {
            responseModalities: [Modality.AUDIO],
            systemInstruction: buildAssistantInstructions('ar'),
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Kore' },
              },
            },
            inputAudioTranscription: { languageCodes: ['ar-EG'] },
            outputAudioTranscription: {},
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            sessionResumption: {},
            contextWindowCompression: {
              slidingWindow: { targetTokens: '8000' },
              triggerTokens: '20000',
            },
            tools: [
              {
                functionDeclarations: [
                  bookingFunctionDeclaration,
                  ...websiteControlFunctionDeclarations,
                ],
              },
            ],
          },
        },
      },
    })

    return NextResponse.json({
      token: token.name,
      model: liveModel,
      expiresAt: new Date(now + 30 * 60 * 1000).toISOString(),
    })
  } catch (error) {
    console.error('Gemini Live token route error', error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create a Gemini Live session token.',
      },
      { status: 500 },
    )
  }
}
