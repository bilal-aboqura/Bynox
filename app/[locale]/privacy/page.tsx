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
    title: 'Privacy Policy',
    description:
      'This policy explains how MinuHub handles information when you use its website, smart menu, AI assistant, or WhatsApp demo.',
    updatedLabel: 'Effective August 5, 2026',
    relatedLabel: 'Read the data deletion instructions',
    sections: [
      {
        title: '1. Scope and operator',
        paragraphs: [
          'This policy applies to the MinuHub demo available on bynox.vercel.app and to its connected WhatsApp experience. MinuHub is a demonstration smart-menu service operated by Bynox.',
        ],
      },
      {
        title: '2. Information we process',
        items: [
          'Website requests, menu selections, cart contents, and booking details you choose to provide.',
          'WhatsApp identifiers such as your phone number or WhatsApp user ID, profile name, message identifiers, timestamps, and delivery status.',
          'The text, voice notes, and other supported content you send to the MinuHub assistant.',
          'Basic technical information required to secure, operate, and troubleshoot the service.',
        ],
      },
      {
        title: '3. How we use information',
        items: [
          'Understand your request, answer menu questions, and manage the demo cart.',
          'Process voice notes and generate a natural-language response.',
          'Maintain short conversational context and prevent duplicate webhook processing.',
          'Protect the service, diagnose failures, and improve reliability using limited technical logs.',
        ],
      },
      {
        title: '4. Service providers',
        paragraphs: [
          'MinuHub uses Meta WhatsApp Cloud API to receive and send WhatsApp messages, Google Gemini to understand requests and generate responses, and Vercel to host the application. These providers may process the information needed to deliver their services under their own terms and privacy policies.',
          'MinuHub does not sell personal information or use WhatsApp message content for third-party advertising.',
        ],
      },
      {
        title: '5. Retention',
        paragraphs: [
          'The WhatsApp demo keeps conversational context and cart state in temporary server memory for up to six hours. Message identifiers used to prevent duplicate processing may remain in memory for up to 24 hours. Voice-note files are downloaded for processing and are not intentionally stored by MinuHub after that processing finishes.',
          'Hosting, AI, and messaging providers may retain security or operational records according to their own policies. The demo session can also reset earlier whenever the server restarts.',
        ],
      },
      {
        title: '6. Security and your choices',
        paragraphs: [
          'We use signed webhook verification, restricted demo recipients, server-side credentials, and encrypted HTTPS connections. No internet service can guarantee absolute security.',
          'You may stop using the service at any time and can request immediate deletion of MinuHub’s temporary WhatsApp session by following the linked data deletion instructions.',
        ],
      },
      {
        title: '7. Children',
        paragraphs: [
          'MinuHub is not designed to knowingly collect personal information from children under the age required by applicable law. A parent or guardian may request deletion if a child submitted information.',
        ],
      },
      {
        title: '8. Changes and contact',
        paragraphs: [
          'We may update this policy as the demo changes. The effective date above identifies the latest version. For a privacy request, use the data-deletion method described on this website or the contact channel published on the MinuHub website.',
        ],
      },
    ],
  },
  ar: {
    title: 'سياسة الخصوصية',
    description:
      'توضح هذه السياسة كيفية تعامل MinuHub مع المعلومات عند استخدام الموقع أو المنيو الذكي أو مساعد الذكاء الاصطناعي أو تجربة واتساب.',
    updatedLabel: 'سارية من 5 أغسطس 2026',
    relatedLabel: 'اقرأ تعليمات حذف البيانات',
    sections: [
      {
        title: '1. نطاق السياسة والجهة المشغلة',
        paragraphs: [
          'تنطبق هذه السياسة على تجربة MinuHub المتاحة عبر bynox.vercel.app وتجربة واتساب المرتبطة بها. MinuHub هو نموذج لمنيو ذكي تديره Bynox.',
        ],
      },
      {
        title: '2. المعلومات التي نعالجها',
        items: [
          'طلبات الموقع واختيارات المنيو ومحتوى السلة وبيانات الحجز التي تختار تقديمها.',
          'معرّفات واتساب مثل رقم الهاتف أو معرّف مستخدم واتساب والاسم ومعرّف الرسالة والتوقيت وحالة التسليم.',
          'النصوص والرسائل الصوتية والمحتوى المدعوم الذي ترسله إلى مساعد MinuHub.',
          'معلومات تقنية أساسية لازمة لتأمين الخدمة وتشغيلها ومعالجة الأعطال.',
        ],
      },
      {
        title: '3. كيف نستخدم المعلومات',
        items: [
          'فهم طلبك والإجابة عن أسئلة المنيو وإدارة سلة الديمو.',
          'معالجة الرسائل الصوتية وإنشاء رد طبيعي.',
          'الاحتفاظ بسياق محادثة قصير ومنع تكرار معالجة نفس الرسالة.',
          'حماية الخدمة وتشخيص الأعطال وتحسين الاعتمادية باستخدام سجلات تقنية محدودة.',
        ],
      },
      {
        title: '4. مقدمو الخدمة',
        paragraphs: [
          'يستخدم MinuHub واجهة Meta WhatsApp Cloud API لاستقبال رسائل واتساب وإرسالها، وGoogle Gemini لفهم الطلبات وإنشاء الردود، وVercel لاستضافة التطبيق. قد يعالج هؤلاء المزودون المعلومات اللازمة لتقديم خدماتهم وفق شروطهم وسياسات الخصوصية الخاصة بهم.',
          'لا يبيع MinuHub البيانات الشخصية ولا يستخدم محتوى رسائل واتساب لإعلانات جهات خارجية.',
        ],
      },
      {
        title: '5. مدة الاحتفاظ',
        paragraphs: [
          'يحتفظ ديمو واتساب بسياق المحادثة والسلة في ذاكرة الخادم المؤقتة لمدة تصل إلى 6 ساعات. وقد تبقى معرّفات الرسائل المستخدمة لمنع التكرار لمدة تصل إلى 24 ساعة. تُنزّل ملفات الفويس للمعالجة ولا يخزنها MinuHub عمدًا بعد انتهاء المعالجة.',
          'قد يحتفظ مزودو الاستضافة والذكاء الاصطناعي والمراسلة بسجلات أمنية أو تشغيلية وفق سياساتهم. وقد تنتهي جلسة الديمو قبل ذلك عند إعادة تشغيل الخادم.',
        ],
      },
      {
        title: '6. الأمان واختياراتك',
        paragraphs: [
          'نستخدم التحقق من توقيع Webhook وتقييد رقم الديمو وحفظ بيانات الاتصال على الخادم واتصالات HTTPS المشفرة. لا توجد خدمة إنترنت يمكنها ضمان الأمان المطلق.',
          'يمكنك التوقف عن استخدام الخدمة في أي وقت، وطلب حذف جلسة واتساب المؤقتة فورًا باتباع تعليمات حذف البيانات المرتبطة بهذه الصفحة.',
        ],
      },
      {
        title: '7. الأطفال',
        paragraphs: [
          'لم تُصمم MinuHub لجمع بيانات شخصية عمدًا من أطفال دون السن المحدد في القانون المعمول به. ويمكن لولي الأمر طلب الحذف إذا قدم طفل معلومات.',
        ],
      },
      {
        title: '8. التعديلات والتواصل',
        paragraphs: [
          'قد نحدّث السياسة مع تطور الديمو. يوضح تاريخ السريان أعلاه أحدث نسخة. لطلب يتعلق بالخصوصية، استخدم طريقة حذف البيانات الموضحة بالموقع أو قناة التواصل المنشورة على موقع MinuHub.',
        ],
      },
    ],
  },
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const isArabic = locale === 'ar'

  return {
    title: isArabic ? 'سياسة الخصوصية | MinuHub' : 'Privacy Policy | MinuHub',
    description: isArabic
      ? 'سياسة خصوصية موقع ومساعد MinuHub.'
      : 'Privacy policy for the MinuHub website and assistant.',
  }
}

export default async function PrivacyPage({ params }: PageProps) {
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
      alternateHref={`/${locale === 'ar' ? 'en' : 'ar'}/privacy`}
      relatedHref={`/${locale}/data-deletion`}
      relatedLabel={copy.relatedLabel}
    />
  )
}
