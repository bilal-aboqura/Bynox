export const locales = ['en', 'ar'] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale)
}

export function getDirection(locale: Locale) {
  return locale === 'ar' ? 'rtl' : 'ltr'
}

export function getAlternateLocale(locale: Locale): Locale {
  return locale === 'ar' ? 'en' : 'ar'
}
