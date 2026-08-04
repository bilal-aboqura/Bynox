import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LegalDocument, type LegalSection } from '@/components/legal-document'
import { isLocale } from '@/i18n/config'

type PageProps = {
  params: Promise<{ locale: string }>
}

const content: Record<
  'en' | 'ar',
  {
    title: string
    description: string
    updatedLabel: string
    relatedLabel: string
    sections: LegalSection[]
  }
> = {
  en: {
    title: 'Data Deletion Instructions',
    description:
      'You can clear the temporary conversation context and cart associated with your MinuHub WhatsApp demo session.',
    updatedLabel: 'Immediate in-app deletion',
    relatedLabel: 'Read the Privacy Policy',
    sections: [
      {
        title: 'Delete through WhatsApp',
        items: [
          'Open the WhatsApp conversation with the MinuHub number you used for the demo.',
          'Send the exact message “DELETE MY DATA” or the Arabic message “احذف بياناتي”.',
          'MinuHub will clear the temporary conversation context and demo cart, then send a confirmation reply.',
        ],
      },
      {
        title: 'What is deleted',
        paragraphs: [
          'The request removes the short-lived conversation history and cart stored by the MinuHub server for your WhatsApp identifier. The current request may still appear in your own WhatsApp chat history.',
        ],
      },
      {
        title: 'Provider-held records',
        paragraphs: [
          'Meta, Google, Vercel, or your device may hold separate operational records under their own policies. MinuHub cannot delete records controlled exclusively by those providers. Use the privacy controls offered by the relevant provider for those records.',
        ],
      },
      {
        title: 'Automatic expiry',
        paragraphs: [
          'Even without a deletion request, the demo conversation context and cart expire after up to six hours and may disappear earlier when the server restarts. Duplicate-message identifiers expire after up to 24 hours and do not contain the conversation text.',
        ],
      },
      {
        title: 'Need help?',
        paragraphs: [
          'If the WhatsApp command is unavailable, use the contact channel published on the MinuHub website and state that your request concerns WhatsApp demo data. Do not include passwords, access tokens, or payment information.',
        ],
      },
    ],
  },
  ar: {
    title: 'تعليمات حذف البيانات',
    description:
      'يمكنك مسح سياق المحادثة والسلة المؤقتين المرتبطين بجلسة ديمو MinuHub على واتساب.',
    updatedLabel: 'حذف فوري من داخل المحادثة',
    relatedLabel: 'اقرأ سياسة الخصوصية',
    sections: [
      {
        title: 'الحذف من خلال واتساب',
        items: [
          'افتح محادثة واتساب مع رقم MinuHub الذي استخدمته في الديمو.',
          'أرسل الرسالة «احذف بياناتي» أو الرسالة الإنجليزية “DELETE MY DATA”.',
          'سيمسح MinuHub سياق المحادثة والسلة المؤقتين ثم يرسل لك تأكيدًا.',
        ],
      },
      {
        title: 'ما الذي يتم حذفه؟',
        paragraphs: [
          'يحذف الطلب سجل المحادثة القصير والسلة اللذين يخزنهما خادم MinuHub لمعرّف واتساب الخاص بك. وقد تظل الرسالة الحالية ظاهرة في سجل واتساب على جهازك.',
        ],
      },
      {
        title: 'السجلات لدى مزودي الخدمة',
        paragraphs: [
          'قد تحتفظ Meta أو Google أو Vercel أو جهازك بسجلات تشغيلية منفصلة وفق سياسات كل جهة. لا يستطيع MinuHub حذف السجلات التي يتحكم فيها هؤلاء المزودون وحدهم. استخدم إعدادات الخصوصية لدى المزود المعني للتحكم فيها.',
        ],
      },
      {
        title: 'الانتهاء التلقائي',
        paragraphs: [
          'حتى بدون طلب حذف، ينتهي سياق محادثة الديمو والسلة بعد مدة تصل إلى 6 ساعات وقد يختفيان قبل ذلك عند إعادة تشغيل الخادم. وتنتهي معرّفات منع تكرار الرسائل خلال مدة تصل إلى 24 ساعة ولا تحتوي على نص المحادثة.',
        ],
      },
      {
        title: 'تحتاج مساعدة؟',
        paragraphs: [
          'إذا تعذر استخدام أمر واتساب، استخدم قناة التواصل المنشورة على موقع MinuHub واذكر أن طلبك يخص بيانات ديمو واتساب. لا ترسل كلمات مرور أو Access Tokens أو بيانات دفع.',
        ],
      },
    ],
  },
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const isArabic = locale === 'ar'

  return {
    title: isArabic
      ? 'تعليمات حذف البيانات | MinuHub'
      : 'Data Deletion Instructions | MinuHub',
    description: isArabic
      ? 'طريقة حذف بيانات جلسة MinuHub التجريبية.'
      : 'How to delete MinuHub demo session data.',
  }
}

export default async function DataDeletionPage({ params }: PageProps) {
  const { locale } = await params

  if (!isLocale(locale)) notFound()
  const copy = content[locale]

  return (
    <LegalDocument
      locale={locale}
      title={copy.title}
      description={copy.description}
      updatedLabel={copy.updatedLabel}
      sections={copy.sections}
      alternateHref={`/${locale === 'ar' ? 'en' : 'ar'}/data-deletion`}
      relatedHref={`/${locale}/privacy`}
      relatedLabel={copy.relatedLabel}
    />
  )
}
