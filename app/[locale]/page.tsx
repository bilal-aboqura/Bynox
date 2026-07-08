import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { BestSellers } from '@/components/best-sellers'
import { Rooms } from '@/components/rooms'
import { Booking } from '@/components/booking'
import { Menu } from '@/components/menu'
import { Packages } from '@/components/packages'
import { About } from '@/components/about'
import { Gallery } from '@/components/gallery'
import { Contact } from '@/components/contact'
import { SiteFooter } from '@/components/site-footer'
import { getAlternateLocale, isLocale } from '@/i18n/config'
import { getSiteContent } from '@/i18n/site-content'

type PageProps = {
  params: Promise<{ locale: string }>
}

export default async function Home({ params }: PageProps) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const content = getSiteContent(locale)

  return (
    <>
      <SiteHeader
        locale={locale}
        alternateLocale={getAlternateLocale(locale)}
        content={content.header}
      />
      <main>
        <Hero content={content.hero} />
        <BestSellers content={content.bestSellers} />
        <Rooms content={content.rooms} />
        <Booking content={content.booking} />
        <Menu content={content.menu} />
        <Packages content={content.packages} />
        <About content={content.about} />
        <Gallery content={content.gallery} />
        <Contact content={content.contact} />
      </main>
      <SiteFooter content={content.footer} />
    </>
  )
}
