import { GoogleGenAI } from '@google/genai'
import type { Locale } from '@/i18n/config'
import {
  createBooking,
  formatBookingToolResult,
} from '@/lib/booking-service'
import { buildAssistantInstructions } from '@/lib/cafe-knowledge'

export const GEMINI_TEXT_MODEL =
  process.env.GEMINI_TEXT_MODEL || 'gemini-3.5-flash'

export const bookingFunctionDeclaration = {
  name: 'create_booking_request',
  description:
    'Create a room booking only after the guest has provided and explicitly confirmed every required detail.',
  parametersJsonSchema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      roomType: { type: 'string', description: 'Requested room type.' },
      date: { type: 'string', description: 'Booking date.' },
      time: { type: 'string', description: 'Booking start time.' },
      duration: { type: 'string', description: 'Booking duration.' },
      players: { type: 'integer', minimum: 1, description: 'Number of players.' },
      extras: { type: 'string', description: 'Optional extras.' },
      name: { type: 'string', description: 'Guest full name.' },
      phone: { type: 'string', description: 'Guest phone number.' },
      notes: { type: 'string', description: 'Optional booking notes.' },
    },
    required: [
      'roomType',
      'date',
      'time',
      'duration',
      'players',
      'name',
      'phone',
    ],
  },
} as const

const cacheNames = new Map<string, string>()
const cachePromises = new Map<string, Promise<string | null>>()

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY on the server.')
  }

  return new GoogleGenAI({ apiKey })
}

/**
 * Creates one explicit Gemini context cache per locale and process. The cache
 * contains the stable concierge prompt, site knowledge, and booking tool.
 * Requests automatically fall back to the uncached prompt if a project/model
 * does not meet Gemini's minimum cache-token requirement.
 */
export async function getAssistantPromptCache(locale: Locale) {
  const existing = cacheNames.get(locale)

  if (existing) {
    return existing
  }

  const inFlight = cachePromises.get(locale)

  if (inFlight) {
    return inFlight
  }

  const promise = (async () => {
    try {
      const cache = await getClient().caches.create({
        model: GEMINI_TEXT_MODEL,
        config: {
          displayName: `the-lobby-concierge-${locale}`,
          ttl: `${process.env.GEMINI_PROMPT_CACHE_TTL_SECONDS || '3600'}s`,
          systemInstruction: buildAssistantInstructions(locale),
          tools: [{ functionDeclarations: [bookingFunctionDeclaration] }],
        },
      })

      if (cache.name) {
        cacheNames.set(locale, cache.name)
      }

      return cache.name || null
    } catch (error) {
      console.warn('Gemini prompt cache unavailable; using uncached prompt.', error)
      return null
    } finally {
      cachePromises.delete(locale)
    }
  })()

  cachePromises.set(locale, promise)
  return promise
}

type AssistantMessage = {
  role: 'user' | 'assistant'
  content: string
}

function toGeminiContents(messages: AssistantMessage[]) {
  return messages.map((message) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content }],
  }))
}

async function executeBooking(locale: Locale, args: Record<string, unknown>) {
  const booking = createBooking({
    locale,
    roomType: String(args.roomType || ''),
    date: String(args.date || ''),
    time: String(args.time || ''),
    duration: String(args.duration || ''),
    players: Number(args.players),
    extras: args.extras ? String(args.extras) : undefined,
    name: String(args.name || ''),
    phone: String(args.phone || ''),
    notes: args.notes ? String(args.notes) : undefined,
    source: 'ai-assistant',
  })

  return formatBookingToolResult(booking)
}

export async function generateAssistantReply(
  locale: Locale,
  messages: AssistantMessage[],
) {
  const client = getClient()
  const promptCache = await getAssistantPromptCache(locale)
  const contents = toGeminiContents(messages)

  const response = await client.models.generateContent({
    model: GEMINI_TEXT_MODEL,
    contents,
    config: promptCache
      ? { cachedContent: promptCache }
      : { systemInstruction: buildAssistantInstructions(locale) },
  })

  const functionCalls = response.functionCalls

  if (!functionCalls?.length) {
    return response.text || 'I am here to help.'
  }

  const functionParts = functionCalls.map((call) => ({
    functionCall: {
      name: call.name,
      args: call.args || {},
    },
  }))

  const functionResponses = await Promise.all(
    functionCalls.map(async (call) => {
      try {
        const result = await executeBooking(locale, call.args || {})

        return {
          name: call.name,
          id: call.id,
          response: { output: result },
        }
      } catch (error) {
        return {
          name: call.name,
          id: call.id,
          response: {
            error:
              error instanceof Error
                ? error.message
                : 'The booking could not be created.',
          },
        }
      }
    }),
  )

  const followUp = await client.models.generateContent({
    model: GEMINI_TEXT_MODEL,
    contents: [
      ...contents,
      { role: 'model', parts: functionParts },
      {
        role: 'user',
        parts: functionResponses.map((functionResponse) => ({
          functionResponse,
        })),
      },
    ],
    config: promptCache
      ? { cachedContent: promptCache }
      : { systemInstruction: buildAssistantInstructions(locale) },
  })

  return followUp.text || 'Your request has been processed.'
}
