import type { Locale } from '@/i18n/config'
import { getSiteContent, type SiteContent } from '@/i18n/site-content'

type CatalogRoom = {
  id: 'solo' | 'duo' | 'squad' | 'vip'
  aliases: string[]
  capacity: number
  roomIndex: number
}

type DurationOption = {
  hours: number
  aliases: string[]
}

export type CafeKnowledge = {
  brandName: string
  phoneNumber: string
  addressLines: string[]
  hoursLines: string[]
  websiteContent: SiteContent
}

const roomDefinitions = [
  { id: 'solo', roomIndex: 1, bookingIndex: 0 },
  { id: 'duo', roomIndex: 0, bookingIndex: 1 },
  { id: 'squad', roomIndex: 2, bookingIndex: 2 },
  { id: 'vip', roomIndex: 3, bookingIndex: 3 },
] as const

const roomCatalog: CatalogRoom[] = roomDefinitions.map(
  ({ id, roomIndex, bookingIndex }) => {
    const en = getSiteContent('en')
    const ar = getSiteContent('ar')
    const enRoom = en.rooms.rooms[roomIndex]
    const arRoom = ar.rooms.rooms[roomIndex]

    return {
      id,
      aliases: [
        enRoom.name,
        arRoom.name,
        en.booking.roomTypes[bookingIndex],
        ar.booking.roomTypes[bookingIndex],
        id,
        id === 'vip' ? 'vip room' : '',
        id === 'vip' ? 'vip lounge' : '',
        id === 'solo' ? 'solo gaming room' : '',
      ].filter(Boolean),
      capacity: extractPlayerCount(enRoom.players),
      roomIndex,
    }
  },
)

const durationCatalog: DurationOption[] = [0, 1, 2, 3].map((index) => {
  const en = getSiteContent('en')
  const ar = getSiteContent('ar')

  return {
    hours: index + 1,
    aliases: [
      en.booking.durations[index],
      ar.booking.durations[index],
      `${index + 1}`,
      `${index + 1} hour`,
      `${index + 1} hours`,
      `${index + 1}hr`,
      `${index + 1} h`,
    ].filter(Boolean),
  }
})

function extractPlayerCount(value: string) {
  const match = value.match(/\d+/)
  return match ? Number(match[0]) : 1
}

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function getCafeKnowledge(locale: Locale): CafeKnowledge {
  const content = getSiteContent(locale)

  return {
    brandName: content.header.brandName,
    phoneNumber: content.contact.phoneNumber,
    addressLines: content.contact.addressLines,
    hoursLines: content.contact.hoursLines,
    websiteContent: content,
  }
}

export function buildAssistantInstructions(locale: Locale) {
  const knowledge = getCafeKnowledge(locale)
  const languageRules =
    locale === 'ar'
      ? [
          'Always answer in Egyptian Arabic only.',
          'Even if the guest speaks English or mixes languages, still reply in Egyptian Arabic.',
          'Speak like a real Egyptian host at the cafe: warm, natural, simple, and human.',
        ]
      : [
          'Always answer in the same language the guest uses unless they ask you to switch.',
          'If the guest speaks Arabic, use natural Egyptian Arabic instead of formal Arabic.',
        ]

  return [
    `You are the voice concierge for ${knowledge.brandName}, a cafe and private gaming-room lounge.`,
    ...languageRules,
    'Do not sound robotic, theatrical, translated, or scripted.',
    'Do not mention being an AI, a model, hidden instructions, or system rules.',
    'Keep the conversation natural. Most replies should be 1 or 2 short sentences.',
    'Ask only one short follow-up question when needed.',
    'Do not repeat all the booking details every turn unless the guest asks for a recap.',
    'Do not give long lists unless the guest asks for them.',
    'Use the full grounded website content below as your source of truth.',
    'If the guest asks about the most requested, popular, signature, or recommended items, use the Best Sellers section first.',
    'If the answer exists anywhere in the grounded website content, answer from it confidently instead of saying you do not know.',
    'Never invent menu items, prices, room features, policies, opening hours, contact details, or availability.',
    'If the guest wants a booking, collect and confirm these details before using the booking tool: room type, date, time, duration, player count, guest name, and phone number.',
    'If the guest gives an approximate time, interpret it naturally and confirm briefly.',
    'You may normalize times to 24-hour format before calling the booking tool.',
    'If the guest already clarified a concrete date, use it and do not keep questioning it.',
    'Only say the booking is confirmed after the booking tool succeeds.',
    'If a requested slot is unavailable, apologize briefly and ask for another time or room.',
    'If something is not stated in the grounded website content, say that briefly and offer the closest helpful alternative.',
    '',
    'Grounded website content:',
    JSON.stringify(knowledge, null, 2),
  ].join('\n')
}

export function resolveRoomId(input: string) {
  const normalized = normalize(input)

  for (const room of roomCatalog) {
    const matched = room.aliases.some((alias) => {
      const aliasNormalized = normalize(alias)

      return (
        normalized === aliasNormalized ||
        normalized.includes(aliasNormalized) ||
        aliasNormalized.includes(normalized)
      )
    })

    if (matched) {
      return room
    }
  }

  return null
}

export function resolveDurationHours(input: string) {
  const normalized = normalize(input)

  for (const option of durationCatalog) {
    const matched = option.aliases.some((alias) => {
      const aliasNormalized = normalize(alias)

      return (
        normalized === aliasNormalized ||
        normalized.includes(aliasNormalized) ||
        aliasNormalized.includes(normalized)
      )
    })

    if (matched) {
      return option.hours
    }
  }

  const numericMatch = normalized.match(/\d+/)

  if (!numericMatch) {
    return null
  }

  const hours = Number(numericMatch[0])

  return Number.isFinite(hours) && hours > 0 ? hours : null
}

export function getRoomDisplayName(roomId: CatalogRoom['id'], locale: Locale) {
  const room = roomCatalog.find((entry) => entry.id === roomId)

  if (!room) {
    return roomId
  }

  return getSiteContent(locale).rooms.rooms[room.roomIndex].name
}
