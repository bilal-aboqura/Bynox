import Link from 'next/link'
import { Clock, MapPin, MessageCircle, Phone } from 'lucide-react'
import { InstagramIcon } from '@/components/social-icons'
import type { SiteContent } from '@/i18n/site-content'

type ContactProps = {
  content: SiteContent['contact']
}

export function Contact({ content }: ContactProps) {
  return (
    <section id="contact" className="bg-card py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-10 flex flex-col items-start gap-3 md:mb-14">
          <span className="rounded-full bg-peach px-4 py-1.5 text-sm font-semibold text-foreground">
            {content.badge}
          </span>
          <h2 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            {content.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-6 rounded-3xl bg-background p-6 md:p-8">
            <div className="flex items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <MapPin className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-semibold">{content.addressTitle}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {content.addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Clock className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-semibold">{content.hoursTitle}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {content.hoursLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Phone className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-semibold">{content.phoneTitle}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {content.phoneNumber}
                </p>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-3">
              <Link
                href="#booking"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
              >
                <MessageCircle className="size-4" aria-hidden="true" />
                {content.whatsappCta}
              </Link>
              <Link
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border-2 border-foreground px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                <InstagramIcon className="size-4" />
                {content.followCta}
              </Link>
            </div>
          </div>

          <div className="relative flex min-h-72 items-center justify-center overflow-hidden rounded-3xl bg-muted">
            <div className="flex flex-col items-center gap-3 p-8 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <MapPin className="size-6" aria-hidden="true" />
              </span>
              <p className="font-display text-xl font-semibold">
                {content.mapTitle}
              </p>
              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                {content.mapDescription}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
