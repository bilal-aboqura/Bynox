import { Agent, tool } from '@openai/agents'
import { z } from 'zod'
import type { Locale } from '@/i18n/config'
import {
  createBooking,
  formatBookingToolResult,
} from '@/lib/booking-service'
import { buildAssistantInstructions } from '@/lib/cafe-knowledge'

export const bookingParameters = z.object({
  roomType: z.string(),
  date: z.string(),
  time: z.string(),
  duration: z.string(),
  players: z.number().int().min(1),
  extras: z.string().optional(),
  name: z.string(),
  phone: z.string(),
  notes: z.string().optional(),
})

export function createCafeTextAgent(locale: Locale) {
  return new Agent({
    name: 'The Lobby Concierge',
    model: process.env.OPENAI_ASSISTANT_MODEL || 'gpt-5.5',
    instructions: buildAssistantInstructions(locale),
    tools: [
      tool({
        name: 'create_booking_request',
        description:
          'Create a room booking after the guest has provided and confirmed all required reservation details.',
        parameters: bookingParameters,
        execute: async (input) => {
          const booking = createBooking({
            locale,
            roomType: input.roomType,
            date: input.date,
            time: input.time,
            duration: input.duration,
            players: input.players,
            extras: input.extras,
            name: input.name,
            phone: input.phone,
            notes: input.notes,
            source: 'ai-assistant',
          })

          return formatBookingToolResult(booking)
        },
      }),
    ],
  })
}
