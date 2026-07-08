import Link from 'next/link'
import { Check, Crown, Gift, Swords, Zap } from 'lucide-react'
import type { SiteContent } from '@/i18n/site-content'

type PackagesProps = {
  content: SiteContent['packages']
}

const iconMap = {
  zap: Zap,
  swords: Swords,
  crown: Crown,
  gift: Gift,
} as const

export function Packages({ content }: PackagesProps) {
  return (
    <section id="packages" className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-10 flex flex-col items-start gap-3 md:mb-14">
          <span className="rounded-full bg-peach px-4 py-1.5 text-sm font-semibold text-foreground">
            {content.badge}
          </span>
          <h2 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            {content.title}
          </h2>
          <p className="max-w-lg text-pretty leading-relaxed text-muted-foreground">
            {content.description}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {content.items.map((pkg) => {
            const Icon = iconMap[pkg.icon]

            return (
              <article
                key={pkg.name}
                className={`flex flex-col gap-4 rounded-3xl p-6 ${
                  pkg.highlight
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'bg-card text-card-foreground shadow-sm'
                }`}
              >
                <span
                  className={`flex size-11 items-center justify-center rounded-full ${
                    pkg.highlight
                      ? 'bg-primary-foreground/15 text-primary-foreground'
                      : 'bg-muted text-primary'
                  }`}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-xl font-semibold">{pkg.name}</h3>
                  <p className="mt-1 font-display text-3xl font-semibold">
                    {pkg.price}
                  </p>
                </div>
                <ul className="flex flex-1 flex-col gap-2">
                  {pkg.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2 text-sm">
                      <Check
                        className={`mt-0.5 size-4 shrink-0 ${
                          pkg.highlight ? 'text-primary-foreground' : 'text-primary'
                        }`}
                        aria-hidden="true"
                      />
                      <span
                        className={
                          pkg.highlight
                            ? 'text-primary-foreground/90'
                            : 'text-muted-foreground'
                        }
                      >
                        {benefit}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="#booking"
                  className={`inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-transform hover:scale-105 ${
                    pkg.highlight
                      ? 'bg-primary-foreground text-primary'
                      : 'bg-primary text-primary-foreground'
                  }`}
                >
                  {content.buttonLabel}
                </Link>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
