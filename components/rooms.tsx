'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { SiteContent } from '@/i18n/site-content'

type RoomsProps = {
  content: SiteContent['rooms']
}

export function Rooms({ content }: RoomsProps) {
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
      id="rooms"
      className="relative overflow-hidden bg-card py-16 md:py-24"
    >
      <div className="absolute left-0 top-0 w-full overflow-hidden leading-[0]">
        <svg
          className="relative block h-[60px] w-full md:h-[100px]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            className="fill-[#fdf9f4]"
          />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-8 md:px-6 md:pt-12">
        <div className="mb-12 flex flex-col items-center text-center">
          <h2 className="text-balance text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
            {content.title}
          </h2>
        </div>

        <div className="relative group/carousel">
          <button
            type="button"
            onClick={() => scroll('previous')}
            className="absolute -left-4 top-[40%] z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-background text-foreground opacity-0 shadow-lg transition-all hover:scale-105 hover:bg-muted group-hover/carousel:opacity-100 md:flex lg:-left-6"
            aria-label={content.previousLabel}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            type="button"
            onClick={() => scroll('next')}
            className="absolute -right-4 top-[40%] z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-background text-foreground opacity-0 shadow-lg transition-all hover:scale-105 hover:bg-muted group-hover/carousel:opacity-100 md:flex lg:-right-6"
            aria-label={content.nextLabel}
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-6 scroll-smooth snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {content.rooms.map((room) => (
              <article
                key={room.name}
                className="group relative flex h-[400px] w-[85vw] flex-none snap-start flex-col overflow-hidden rounded-[2rem] bg-foreground text-background shadow-md transition-all hover:-translate-y-1 hover:shadow-xl sm:w-[calc(50%-12px)] md:h-[450px] lg:w-[calc(25%-18px)]"
              >
                <div className="relative h-[65%] w-full overflow-hidden">
                  <Image
                    src={room.image || '/placeholder.svg'}
                    alt={room.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-foreground to-transparent" />
                </div>

                <div className="relative flex flex-1 flex-col justify-end bg-foreground p-5 pt-0">
                  <h3 className="mb-1 text-2xl font-bold">{room.name}</h3>
                  <p className="mb-4 text-sm text-background/70">
                    {room.players} | {room.features}
                  </p>

                  <div className="mt-auto flex items-center justify-between gap-3">
                    <span className="text-xl font-bold">{room.price}</span>
                    <Link
                      href="#booking"
                      className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/80"
                    >
                      {content.buttonLabel}
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
