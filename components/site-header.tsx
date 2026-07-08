'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import type { Locale } from '@/i18n/config'
import type { SiteContent } from '@/i18n/site-content'

type SiteHeaderProps = {
  locale: Locale
  alternateLocale: Locale
  content: SiteContent['header']
}

export function SiteHeader({
  locale,
  alternateLocale,
  content,
}: SiteHeaderProps) {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <Image
            src="/images/benox-logo.png"
            alt={`${content.brandName} logo`}
            width={44}
            height={44}
            className="size-11 rounded-full object-cover"
          />
          <span className="font-display text-2xl font-semibold tracking-tight">
            {content.brandName}
          </span>
        </Link>

        <nav
          aria-label={content.mainNavigationLabel}
          className="hidden items-center gap-6 lg:flex"
        >
          {content.navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={`/${alternateLocale}`}
            className={`hidden rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted sm:inline-flex ${
              alternateLocale === 'ar' ? 'font-arabic' : ''
            }`}
          >
            {content.languageSwitchLabel}
          </Link>
          <Link
            href="#booking"
            className="hidden rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105 sm:inline-flex"
          >
            {content.bookingCta}
          </Link>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="inline-flex size-10 items-center justify-center rounded-full border border-border text-foreground lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
            <span className="sr-only">
              {open ? content.closeMenuLabel : content.openMenuLabel}
            </span>
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-menu"
          aria-label={content.mobileNavigationLabel}
          className="border-t border-border bg-background px-4 pb-6 pt-2 lg:hidden"
        >
          <ul className="flex flex-col gap-1">
            {content.navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="mt-2">
              <Link
                href={`/${alternateLocale}`}
                onClick={() => setOpen(false)}
                className={`mb-2 block rounded-full border border-border px-5 py-3 text-center text-base font-semibold text-foreground ${
                  alternateLocale === 'ar' ? 'font-arabic' : ''
                }`}
              >
                {content.languageSwitchLabel}
              </Link>
              <Link
                href="#booking"
                onClick={() => setOpen(false)}
                className="block rounded-full bg-primary px-5 py-3 text-center text-base font-semibold text-primary-foreground"
              >
                {content.bookingCta}
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}
