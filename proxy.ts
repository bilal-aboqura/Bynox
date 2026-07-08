import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { defaultLocale } from '@/i18n/config'

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname !== '/') {
    return NextResponse.next()
  }

  const url = request.nextUrl.clone()
  url.pathname = `/${defaultLocale}`

  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/'],
}
