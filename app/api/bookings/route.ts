import { NextResponse } from 'next/server'
import { isLocale } from '@/i18n/config'
import {
  createBooking,
  isBookingError,
  type BookingRequestInput,
} from '@/lib/booking-service'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as BookingRequestInput

    if (!isLocale(body.locale)) {
      return NextResponse.json({ error: 'Invalid locale.' }, { status: 400 })
    }

    const booking = createBooking({
      locale: body.locale,
      roomType: body.roomType,
      date: body.date,
      time: body.time,
      duration: body.duration,
      players: Number(body.players),
      extras: body.extras,
      name: body.name,
      phone: body.phone,
      notes: body.notes,
      source: body.source,
    })

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        roomLabel: booking.roomLabel,
        date: booking.date,
        time: booking.time,
        duration: booking.duration,
        players: booking.players,
      },
      message:
        body.locale === 'ar'
          ? 'تم تأكيد الحجز بنجاح.'
          : 'Your booking has been confirmed.',
    })
  } catch (error) {
    if (isBookingError(error)) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
        },
        { status: 400 },
      )
    }

    console.error('Booking route error', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Something went wrong while saving the booking.',
      },
      { status: 500 },
    )
  }
}
