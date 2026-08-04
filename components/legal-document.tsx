import Link from 'next/link'
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react'
import type { Locale } from '@/i18n/config'

export type LegalSection = {
  title: string
  paragraphs?: string[]
  items?: string[]
}

type LegalDocumentProps = {
  locale: Locale
  title: string
  description: string
  updatedLabel: string
  sections: LegalSection[]
  alternateHref: string
  relatedHref: string
  relatedLabel: string
}

export function LegalDocument({
  locale,
  title,
  description,
  updatedLabel,
  sections,
  alternateHref,
  relatedHref,
  relatedLabel,
}: LegalDocumentProps) {
  const isArabic = locale === 'ar'
  const BackIcon = isArabic ? ArrowRight : ArrowLeft

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/80 bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-primary font-display text-lg font-semibold text-primary-foreground">
              M
            </span>
            <span className="font-display text-xl font-semibold">MinuHub</span>
          </Link>

          <Link
            href={alternateHref}
            hrefLang={isArabic ? 'en' : 'ar'}
            className={`rounded-full border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${isArabic ? '' : 'font-arabic'}`}
          >
            {isArabic ? 'English' : 'العربية'}
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
        <Link
          href={`/${locale}/menu`}
          className="mb-8 inline-flex min-h-11 items-center gap-2 rounded-full px-1 text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          <BackIcon className="size-4" aria-hidden="true" />
          {isArabic ? 'العودة إلى المنيو' : 'Back to the menu'}
        </Link>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-16">
          <article className="min-w-0">
            <div className="border-b border-border pb-9">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-mint px-3 py-1.5 text-sm font-semibold text-foreground">
                <ShieldCheck className="size-4" aria-hidden="true" />
                {updatedLabel}
              </div>
              <h1 className="max-w-3xl text-pretty font-display text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
                {title}
              </h1>
              <p className="mt-5 max-w-2xl text-pretty text-base leading-8 text-muted-foreground sm:text-lg">
                {description}
              </p>
            </div>

            <div className="divide-y divide-border">
              {sections.map((section) => (
                <section key={section.title} className="py-8 sm:py-10">
                  <h2 className="text-balance font-display text-2xl font-semibold tracking-[-0.02em]">
                    {section.title}
                  </h2>
                  {section.paragraphs?.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="mt-4 max-w-[72ch] text-pretty leading-7 text-muted-foreground"
                    >
                      {paragraph}
                    </p>
                  ))}
                  {section.items && (
                    <ul className="mt-5 max-w-[72ch] space-y-3 ps-5 text-muted-foreground marker:text-primary">
                      {section.items.map((item) => (
                        <li key={item} className="ps-2 leading-7">
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          </article>

          <aside className="h-fit border-t border-primary pt-5 lg:sticky lg:top-6">
            <p className="text-sm leading-6 text-muted-foreground">
              {isArabic
                ? 'محتاج تعرف خطوات التحكم في بياناتك؟'
                : 'Need the steps for controlling your data?'}
            </p>
            <Link
              href={relatedHref}
              className="mt-3 inline-flex min-h-11 items-center font-semibold text-primary underline decoration-2 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              {relatedLabel}
            </Link>
          </aside>
        </div>
      </div>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>© {new Date().getFullYear()} MinuHub</span>
          <span>
            {isArabic
              ? 'تجربة منيو ومساعد طلب ذكي.'
              : 'Smart menu and ordering assistant demo.'}
          </span>
        </div>
      </footer>
    </main>
  )
}
