import Image from 'next/image'
import { Coffee, Gamepad2, HeartHandshake } from 'lucide-react'
import type { SiteContent } from '@/i18n/site-content'

type AboutProps = {
  content: SiteContent['about']
}

const iconMap = {
  coffee: Coffee,
  gamepad: Gamepad2,
  heart: HeartHandshake,
} as const

export function About({ content }: AboutProps) {
  return (
    <section id="about" className="bg-card py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:px-6 lg:grid-cols-2 lg:gap-16">
        <div className="relative order-2 lg:order-1">
          <div
            className="absolute -left-5 -top-5 size-32 rounded-full bg-mint"
            aria-hidden="true"
          />
          <div className="relative overflow-hidden rounded-3xl border-4 border-background shadow-lg">
            <Image
              src="/images/gallery-cafe-interior.png"
              alt={content.imageAlt}
              width={680}
              height={520}
              className="h-auto w-full object-cover"
            />
          </div>
        </div>

        <div className="order-1 flex flex-col gap-5 lg:order-2">
          <span className="w-fit rounded-full bg-mint px-4 py-1.5 text-sm font-semibold text-foreground">
            {content.badge}
          </span>
          <h2 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            {content.title}
          </h2>
          <p className="text-pretty leading-relaxed text-muted-foreground">
            {content.description}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {content.features.map((feature) => {
              const Icon = iconMap[feature.icon]

              return (
                <div
                  key={feature.title}
                  className="flex flex-col gap-2 rounded-2xl bg-background p-4"
                >
                  <Icon className="size-6 text-primary" aria-hidden="true" />
                  <p className="text-sm font-semibold">{feature.title}</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
