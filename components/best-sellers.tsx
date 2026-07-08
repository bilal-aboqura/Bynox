'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef } from 'react'
import type { SiteContent } from '@/i18n/site-content'

type BestSellersProps = {
  content: SiteContent['bestSellers']
}

export function BestSellers({ content }: BestSellersProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'previous' | 'next') => {
    if (!scrollRef.current) {
      return
    }

    const scrollAmount = scrollRef.current.clientWidth

    scrollRef.current.scrollBy({
      left: direction === 'previous' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  return (
    <section
      id="best-sellers"
      className="relative overflow-hidden bg-[#fdf9f4] py-16 md:py-24"
    >
      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-12 flex flex-col items-center text-center">
          <span className="mb-2 text-sm font-bold uppercase tracking-widest text-slate-800">
            {content.eyebrow}
          </span>
          <h2 className="text-balance text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
            {content.title}
          </h2>
        </div>

        <div className="relative group/carousel">
          <button
            type="button"
            onClick={() => scroll('previous')}
            className="absolute -left-4 top-[40%] z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-800 opacity-0 shadow-lg transition-all hover:scale-105 hover:bg-slate-50 group-hover/carousel:opacity-100 md:flex lg:-left-6"
            aria-label={content.previousLabel}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            type="button"
            onClick={() => scroll('next')}
            className="absolute -right-4 top-[40%] z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-800 opacity-0 shadow-lg transition-all hover:scale-105 hover:bg-slate-50 group-hover/carousel:opacity-100 md:flex lg:-right-6"
            aria-label={content.nextLabel}
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-6 scroll-smooth snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {content.products.map((product) => (
              <article
                key={product.name}
                className="group flex w-full flex-none snap-start flex-col overflow-hidden rounded-[2rem] bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]"
              >
                <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-2xl">
                  <div
                    className={`absolute inset-0 m-auto h-[80%] w-[80%] transition-transform duration-500 group-hover:scale-105 ${product.bgColor} ${product.blobShape}`}
                  />
                  <div className="absolute inset-0 m-auto h-[90%] w-[90%] transition-transform duration-500 group-hover:scale-110">
                    <Image
                      src={product.image || '/placeholder.svg'}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="rounded-2xl object-contain drop-shadow-[0_0_8px_rgba(255,255,255,1)]"
                    />
                  </div>
                  {product.tag ? (
                    <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-sunshine px-3 py-1 text-xs font-bold text-foreground shadow-sm">
                      <Star className="size-3 fill-current" aria-hidden="true" />
                      {product.tag}
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-1 flex-col px-2 pb-2 text-start">
                  <h3 className="mb-1 text-xl font-bold text-slate-900">
                    {product.name}
                  </h3>
                  <p className="mb-4 line-clamp-2 text-sm font-medium leading-relaxed text-slate-500">
                    {product.description}
                  </p>

                  <div className="mt-auto flex items-center justify-between gap-3">
                    <span className="text-lg font-extrabold text-[#b84a28]">
                      {product.price}
                    </span>
                    <Link
                      href="#booking"
                      className="flex items-center gap-1 rounded-full bg-[#fcedda] px-4 py-1.5 text-sm font-bold text-[#b84a28] transition-colors hover:bg-[#f6ddbb]"
                    >
                      {content.addLabel}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
