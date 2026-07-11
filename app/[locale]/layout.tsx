import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { DM_Sans, Fredoka } from 'next/font/google'
import { notFound } from 'next/navigation'
import '../globals.css'
import { getDirection, isLocale, locales } from '@/i18n/config'
import { getSiteContent } from '@/i18n/site-content'

const fredoka = Fredoka({
  subsets: ['latin'],
  variable: '--font-fredoka',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
})

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#11090F',
}

type LayoutProps = Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export const dynamicParams = false

export async function generateMetadata({
  params,
}: LayoutProps): Promise<Metadata> {
  const { locale } = await params

  if (!isLocale(locale)) {
    return {}
  }

  const content = getSiteContent(locale)

  return {
    title: content.metadata.title,
    description: content.metadata.description,
    generator: 'Codex',
  }
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  return (
    <html
      lang={locale}
      dir={getDirection(locale)}
      className={`bg-background ${fredoka.variable} ${dmSans.variable} ${locale === 'ar' ? 'locale-arabic' : 'locale-latin'}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playpen+Sans+Arabic:wght@100..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
