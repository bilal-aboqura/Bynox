import type { Locale } from '@/i18n/config'

export type AssistantCopy = {
  title: string
  subtitle: string
  closedLabel: string
  openLabel: string
  startVoice: string
  stopVoice: string
  voiceReady: string
  voiceConnecting: string
  voiceConnected: string
  voiceUnavailable: string
  inputPlaceholder: string
  sendLabel: string
  quickPrompts: string[]
  initialMessage: string
  resetChat: string
  textError: string
}

const copy: Record<Locale, AssistantCopy> = {
  en: {
    title: 'AI Concierge',
    subtitle:
      'Ask about rooms, menu items, prices, opening hours, or book your session by voice.',
    closedLabel: 'Ask Benox AI',
    openLabel: 'Open AI concierge',
    startVoice: 'Start voice chat',
    stopVoice: 'End voice chat',
    voiceReady: 'Voice assistant is ready.',
    voiceConnecting: 'Connecting your voice assistant...',
    voiceConnected: 'Voice chat is live. You can speak naturally.',
    voiceUnavailable:
      'Voice is unavailable right now. You can still chat by text.',
    inputPlaceholder: 'Ask about rooms, drinks, desserts, or booking...',
    sendLabel: 'Send',
    quickPrompts: [
      'What rooms do you have?',
      'Show me the best drinks and desserts.',
      'What are your opening hours?',
      'Book a VIP room for tonight.',
    ],
    initialMessage:
      'Hi! I can help with rooms, menu items, prices, opening hours, and bookings.',
    resetChat: 'New chat',
    textError:
      'Something went wrong while contacting the assistant. Please try again.',
  },
  ar: {
    title: 'Benox',
    subtitle: 'صوت Benox',
    closedLabel: 'اسأل Benox',
    openLabel: 'افتح صوت Benox',
    startVoice: 'شغّل',
    stopVoice: 'اقفل',
    voiceReady: 'جاهز أسمعك',
    voiceConnecting: 'بوصّل...',
    voiceConnected: 'اتكلم',
    voiceUnavailable: 'في مشكلة في الصوت دلوقتي.',
    inputPlaceholder: 'اسأل عن الغرف أو المنيو أو الحجز...',
    sendLabel: 'إرسال',
    quickPrompts: [
      'إيه الغرف المتاحة؟',
      'ورّيني أحلى مشروبات وحلويات.',
      'مواعيدكم إيه؟',
      'احجزلي VIP الليلة.',
    ],
    initialMessage: 'أنا معاك، قول لي تحب إيه.',
    resetChat: 'شات جديد',
    textError: 'حصلت مشكلة في التواصل مع المساعد. حاول تاني.',
  },
}

export function getAssistantCopy(locale: Locale) {
  return copy[locale]
}
