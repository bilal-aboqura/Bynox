import Image from 'next/image'
import type { SiteContent } from '@/i18n/site-content'

type GalleryProps = {
  content: SiteContent['gallery']
}

export function Gallery({ content }: GalleryProps) {
  return (
    <section id="gallery" className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-10 flex flex-col items-start gap-3 md:mb-14">
          <span className="rounded-full bg-sunshine px-4 py-1.5 text-sm font-semibold text-foreground">
            {content.badge}
          </span>
          <h2 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            {content.title}
          </h2>
          <p className="max-w-lg text-pretty leading-relaxed text-muted-foreground">
            {content.description}
          </p>
        </div>

        <div className="grid auto-rows-[180px] grid-cols-2 gap-4 md:auto-rows-[220px] md:grid-cols-3">
          {content.photos.map((photo) => (
            <div
              key={photo.src + photo.alt}
              className={`relative overflow-hidden rounded-3xl ${photo.className}`}
            >
              <Image
                src={photo.src || '/placeholder.svg'}
                alt={photo.alt}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
