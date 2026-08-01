import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SmartMenuPage } from '@/components/smart-menu-page'
import { isLocale } from '@/i18n/config'

type PageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params

  return {
    title: locale === 'ar' ? 'MinuHub | المنيو الذكي' : 'MinuHub | Smart Menu',
    description:
      locale === 'ar'
        ? 'تصفح منيو MinuHub واطلب يدويًا أو بالصوت مع Minu.'
        : 'Browse MinuHub and order manually or by voice with Minu.',
  }
}

export default async function SmartMenuRoute({ params }: PageProps) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  return <SmartMenuPage locale={locale} />
}
