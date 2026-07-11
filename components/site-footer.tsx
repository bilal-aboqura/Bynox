import Image from 'next/image'
import Link from 'next/link'
import {
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
} from '@/components/social-icons'
import type { SiteContent } from '@/i18n/site-content'

type SiteFooterProps = {
  content: SiteContent['footer']
}

export function SiteFooter({ content }: SiteFooterProps) {
  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4 md:px-6">
        <div className="flex flex-col gap-4 md:col-span-2">
          <div className="flex items-center gap-2">
            <Image
              src="/images/the-lobby-logo.png"
              alt="The Lobby logo"
              width={44}
              height={44}
              className="size-11 rounded-full object-cover"
            />
            <span className="font-display text-2xl font-semibold">The Lobby</span>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-background/70">
            {content.description}
          </p>
          <div className="flex gap-3">
            <Link
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex size-10 items-center justify-center rounded-full bg-background/10 transition-colors hover:bg-primary"
            >
              <InstagramIcon className="size-4" />
              <span className="sr-only">Instagram</span>
            </Link>
            <Link
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex size-10 items-center justify-center rounded-full bg-background/10 transition-colors hover:bg-primary"
            >
              <TwitterIcon className="size-4" />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex size-10 items-center justify-center rounded-full bg-background/10 transition-colors hover:bg-primary"
            >
              <FacebookIcon className="size-4" />
              <span className="sr-only">Facebook</span>
            </Link>
          </div>
        </div>

        <nav aria-label={content.quickLinksTitle} className="flex flex-col gap-3">
          <h3 className="font-display text-lg font-semibold">
            {content.quickLinksTitle}
          </h3>
          <ul className="flex flex-col gap-2">
            {content.quickLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-background/70 transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-3">
          <h3 className="font-display text-lg font-semibold">
            {content.openingHoursTitle}
          </h3>
          <p className="text-sm leading-relaxed text-background/70">
            {content.hoursLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
          <p className="text-sm leading-relaxed text-background/70">
            {content.addressLine}
          </p>
        </div>
      </div>

      <div className="border-t border-background/10">
        <p className="mx-auto max-w-6xl px-4 py-5 text-center text-xs text-background/50 md:px-6">
          &copy; {new Date().getFullYear()} {content.copyrightLabel}
        </p>
      </div>
    </footer>
  )
}
