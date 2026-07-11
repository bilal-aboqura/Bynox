import Image from 'next/image'
import Link from 'next/link'
import { Coffee, Gamepad2 } from 'lucide-react'
import type { SiteContent } from '@/i18n/site-content'

type HeroProps = {
  content: SiteContent['hero']
}

export function Hero({ content }: HeroProps) {
  return (
    <section id="home" className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-12 md:px-6 md:pb-24 md:pt-20 lg:grid-cols-2">
        <div className="relative z-10 flex flex-col items-start gap-6">
          <h1 className="text-balance text-5xl font-semibold leading-tight tracking-tight md:text-6xl lg:text-7xl">
            {content.title}{' '}
            <span className="text-primary">{content.highlightedWord}</span>
          </h1>

          <p className="max-w-md text-pretty text-lg leading-relaxed text-muted-foreground">
            {content.description}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="#booking"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground transition-transform hover:scale-105"
            >
              <Gamepad2 className="size-5" aria-hidden="true" />
              {content.primaryCta}
            </Link>
            <Link
              href="#menu"
              className="inline-flex items-center gap-2 rounded-full border-2 border-foreground px-7 py-3 text-base font-semibold text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              <Coffee className="size-5" aria-hidden="true" />
              {content.secondaryCta}
            </Link>
          </div>
        </div>

        <div className="relative">
          <div
            className="absolute -right-8 -top-8 size-40 rounded-full bg-peach md:size-56"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-6 -left-6 size-28 rounded-full bg-sunshine md:size-36"
            aria-hidden="true"
          />
          <div className="relative overflow-hidden rounded-3xl border-4 border-card shadow-xl">
            <Image
              src="/images/hero-the-lobby.png"
              alt={content.imageAlt}
              width={720}
              height={720}
              priority
              className="h-auto w-full object-cover"
            />
          </div>
        </div>
      </div>

      <svg
        className="block w-full text-card"
        viewBox="0 0 1440 60"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 60V30C240 0 480 0 720 20C960 40 1200 40 1440 15V60H0Z"
          fill="currentColor"
        />
      </svg>
    </section>
  )
}
