'use client'

import { useState } from 'react'
import { CalendarCheck, Gamepad2, PartyPopper } from 'lucide-react'
import type { SiteContent } from '@/i18n/site-content'

type BookingProps = {
  content: SiteContent['booking']
}

export function Booking({ content }: BookingProps) {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <section id="booking" className="bg-foreground py-16 text-background md:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 md:px-6 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
        <div className="flex flex-col justify-center gap-5">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground">
            <Gamepad2 className="size-4" aria-hidden="true" />
            {content.badge}
          </span>
          <h2 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            {content.title}
          </h2>
          <p className="max-w-md text-pretty leading-relaxed text-background/70">
            {content.description}
          </p>
          <ul className="flex flex-col gap-3 text-sm text-background/80">
            {content.steps.map((step, index) => (
              <li key={step} className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-full bg-primary/20 text-primary">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl bg-card p-6 text-card-foreground shadow-xl md:p-8">
          {submitted ? (
            <div className="flex h-full min-h-72 flex-col items-center justify-center gap-4 text-center">
              <span className="flex size-16 items-center justify-center rounded-full bg-mint">
                <PartyPopper className="size-8 text-foreground" aria-hidden="true" />
              </span>
              <h3 className="text-2xl font-semibold">{content.successTitle}</h3>
              <p className="max-w-sm leading-relaxed text-muted-foreground">
                {content.successDescription}
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="rounded-full border-2 border-primary px-5 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                {content.successReset}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label htmlFor="room" className="text-sm font-semibold">
                  {content.roomLabel}
                </label>
                <select
                  id="room"
                  name="room"
                  required
                  className="rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm"
                >
                  {content.roomTypes.map((room) => (
                    <option key={room}>{room}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="date" className="text-sm font-semibold">
                  {content.dateLabel}
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  required
                  className="rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="time" className="text-sm font-semibold">
                  {content.timeLabel}
                </label>
                <input
                  id="time"
                  name="time"
                  type="time"
                  required
                  className="rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="duration" className="text-sm font-semibold">
                  {content.durationLabel}
                </label>
                <select
                  id="duration"
                  name="duration"
                  required
                  className="rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm"
                >
                  {content.durations.map((duration) => (
                    <option key={duration}>{duration}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="players" className="text-sm font-semibold">
                  {content.playersLabel}
                </label>
                <input
                  id="players"
                  name="players"
                  type="number"
                  min={1}
                  max={6}
                  defaultValue={2}
                  required
                  className="rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label htmlFor="extras" className="text-sm font-semibold">
                  {content.extrasLabel}
                </label>
                <select
                  id="extras"
                  name="extras"
                  className="rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm"
                >
                  {content.extras.map((extra) => (
                    <option key={extra}>{extra}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="name" className="text-sm font-semibold">
                  {content.nameLabel}
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder={content.namePlaceholder}
                  required
                  className="rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="phone" className="text-sm font-semibold">
                  {content.phoneLabel}
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder={content.phonePlaceholder}
                  required
                  className="rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm"
                />
              </div>

              <button
                type="submit"
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground transition-transform hover:scale-[1.02] sm:col-span-2"
              >
                <CalendarCheck className="size-5" aria-hidden="true" />
                {content.submitLabel}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
