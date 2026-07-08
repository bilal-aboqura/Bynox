import {
  Coffee,
  CupSoda,
  Cake,
  Popcorn,
  Citrus,
  Gamepad2,
} from 'lucide-react'
import type { SiteContent } from '@/i18n/site-content'

type MenuProps = {
  content: SiteContent['menu']
}

const iconMap = {
  coffee: Coffee,
  soda: CupSoda,
  cake: Cake,
  popcorn: Popcorn,
  citrus: Citrus,
  gamepad: Gamepad2,
} as const

export function Menu({ content }: MenuProps) {
  return (
    <section id="menu" className="bg-card py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-10 flex flex-col items-start gap-3 md:mb-14">
          <span className="rounded-full bg-sunshine px-4 py-1.5 text-sm font-semibold text-foreground">
            {content.badge}
          </span>
          <h2 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            {content.title}
          </h2>
          <p className="max-w-lg text-pretty leading-relaxed text-muted-foreground">
            {content.description}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {content.categories.map((category) => {
            const Icon = iconMap[category.icon]

            return (
              <div
                key={category.title}
                className="flex flex-col gap-4 rounded-3xl bg-background p-6"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="text-xl font-semibold">{category.title}</h3>
                </div>
                <ul className="flex flex-col gap-3">
                  {category.items.map((item) => (
                    <li
                      key={item.name}
                      className="flex items-baseline justify-between gap-3 border-b border-dashed border-border pb-3 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                      <span className="whitespace-nowrap text-sm font-bold text-primary">
                        {item.price}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
