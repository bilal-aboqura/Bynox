import type { Locale } from '@/i18n/config'
import {
  getRoomDisplayName,
  resolveDurationHours,
  resolveRoomId,
} from '@/lib/cafe-knowledge'

export type BookingSource = 'website-form' | 'ai-assistant'

export type BookingRequestInput = {
  locale: Locale
  roomType: string
  date: string
  time: string
  duration: string
  players: number
  extras?: string
  name: string
  phone: string
  notes?: string
  source?: BookingSource
}

export type BookingRecord = {
  id: string
  locale: Locale
  roomId: 'solo' | 'duo' | 'squad' | 'vip'
  roomLabel: string
  date: string
  time: string
  duration: string
  durationHours: number
  startMinutes: number
  endMinutes: number
  players: number
  extras: string
  name: string
  phone: string
  notes: string
  source: BookingSource
  createdAt: string
}

class BookingError extends Error {
  constructor(
    message: string,
    readonly code:
      | 'INVALID_ROOM'
      | 'INVALID_DURATION'
      | 'INVALID_DATE'
      | 'INVALID_TIME'
      | 'INVALID_PLAYERS'
      | 'ROOM_CAPACITY'
      | 'SLOT_TAKEN',
  ) {
    super(message)
    this.name = 'BookingError'
  }
}

type BookingStore = {
  bookings: BookingRecord[]
}

const bookingStore = (globalThis as typeof globalThis & {
  __bynoxBookingStore?: BookingStore
}).__bynoxBookingStore ?? { bookings: [] }

if (!(globalThis as typeof globalThis & { __bynoxBookingStore?: BookingStore }).__bynoxBookingStore) {
  ;(globalThis as typeof globalThis & { __bynoxBookingStore?: BookingStore }).__bynoxBookingStore =
    bookingStore
}

function localize(locale: Locale, en: string, ar: string) {
  return locale === 'ar' ? ar : en
}

function parseDate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return null
  }

  const parsed = new Date(`${date}T00:00:00`)

  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function parseTime(time: string) {
  const normalized = time
    .trim()
    .toLowerCase()
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/\s+/g, ' ')

  const isPm =
    normalized.includes('pm') ||
    normalized.includes('مساء') ||
    normalized.includes('بليل') ||
    normalized.includes('ليل')

  const isAm =
    normalized.includes('am') ||
    normalized.includes('صباح') ||
    normalized.includes('الصبح') ||
    normalized.includes('صبح')

  const cleaned = normalized
    .replace(/مساءً|مساء|بليل|ليل|pm|am|صباحًا|صباحا|صباح|الصبح|صبح/g, '')
    .replace(/\./g, ':')
    .replace(/\s+/g, '')

  const match =
    cleaned.match(/^(\d{1,2}):(\d{2})$/) ||
    cleaned.match(/^(\d{1,2})$/)

  if (!match) {
    return null
  }

  const hours = Number(match[1])
  const minutes = match[2] ? Number(match[2]) : 0

  if (hours > 23 || minutes > 59) {
    return null
  }

  let normalizedHours = hours

  if (isPm && normalizedHours < 12) {
    normalizedHours += 12
  }

  if (isAm && normalizedHours === 12) {
    normalizedHours = 0
  }

  if (normalizedHours > 23) {
    return null
  }

  return normalizedHours * 60 + minutes
}

function buildReference() {
  return `BNX-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

export function isBookingError(error: unknown): error is BookingError {
  return error instanceof BookingError
}

export function createBooking(input: BookingRequestInput) {
  const room = resolveRoomId(input.roomType)

  if (!room) {
    throw new BookingError(
      localize(
        input.locale,
        'Please choose one of the available room types.',
        'من فضلك اختر نوع غرفة من الخيارات المتاحة.',
      ),
      'INVALID_ROOM',
    )
  }

  const durationHours = resolveDurationHours(input.duration)

  if (!durationHours) {
    throw new BookingError(
      localize(
        input.locale,
        'Please choose a valid booking duration.',
        'من فضلك اختر مدة حجز صحيحة.',
      ),
      'INVALID_DURATION',
    )
  }

  const parsedDate = parseDate(input.date)

  if (!parsedDate) {
    throw new BookingError(
      localize(
        input.locale,
        'Please enter a valid booking date.',
        'من فضلك أدخل تاريخ حجز صحيح.',
      ),
      'INVALID_DATE',
    )
  }

  const startMinutes = parseTime(input.time)

  if (startMinutes === null) {
    throw new BookingError(
      localize(
        input.locale,
        'Please enter a valid booking time.',
        'من فضلك أدخل وقت حجز صحيح.',
      ),
      'INVALID_TIME',
    )
  }

  const players = Number(input.players)

  if (!Number.isFinite(players) || players < 1) {
    throw new BookingError(
      localize(
        input.locale,
        'Player count must be at least 1.',
        'عدد اللاعبين يجب أن يكون 1 على الأقل.',
      ),
      'INVALID_PLAYERS',
    )
  }

  if (players > room.capacity) {
    throw new BookingError(
      localize(
        input.locale,
        `That room fits up to ${room.capacity} player${room.capacity === 1 ? '' : 's'}.`,
        `هذه الغرفة تتسع حتى ${room.capacity} ${room.capacity === 1 ? 'لاعب' : 'لاعبين'}.`,
      ),
      'ROOM_CAPACITY',
    )
  }

  const endMinutes = startMinutes + durationHours * 60

  const overlappingBooking = bookingStore.bookings.find((booking) => {
    return (
      booking.roomId === room.id &&
      booking.date === input.date &&
      startMinutes < booking.endMinutes &&
      endMinutes > booking.startMinutes
    )
  })

  if (overlappingBooking) {
    throw new BookingError(
      localize(
        input.locale,
        'That room is already booked for the selected time. Please choose another slot.',
        'هذه الغرفة محجوزة بالفعل في هذا الوقت. من فضلك اختر وقتًا آخر.',
      ),
      'SLOT_TAKEN',
    )
  }

  const booking: BookingRecord = {
    id: buildReference(),
    locale: input.locale,
    roomId: room.id,
    roomLabel: getRoomDisplayName(room.id, input.locale),
    date: input.date,
    time: input.time,
    duration: input.duration,
    durationHours,
    startMinutes,
    endMinutes,
    players,
    extras: input.extras?.trim() || localize(input.locale, 'No extras', 'بدون إضافات'),
    name: input.name.trim(),
    phone: input.phone.trim(),
    notes: input.notes?.trim() || '',
    source: input.source ?? 'website-form',
    createdAt: new Date().toISOString(),
  }

  bookingStore.bookings.push(booking)

  return booking
}

export function formatBookingToolResult(booking: BookingRecord) {
  return [
    `Booking confirmed.`,
    `Reference: ${booking.id}`,
    `Room: ${booking.roomLabel}`,
    `Date: ${booking.date}`,
    `Time: ${booking.time}`,
    `Duration: ${booking.duration}`,
    `Players: ${booking.players}`,
    `Extras: ${booking.extras}`,
    `Guest: ${booking.name}`,
    `Phone: ${booking.phone}`,
  ].join('\n')
}
