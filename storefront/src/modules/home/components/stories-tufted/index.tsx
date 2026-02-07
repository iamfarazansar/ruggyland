"use client"

import { useCallback } from "react"
import Image from "next/image"
import useEmblaCarousel from "embla-carousel-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { RugStory } from "@lib/data/rug-stories"

// Carousel component (client-side)
function StoriesCarousel({ stories }: { stories: RugStory[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    skipSnaps: false,
    dragFree: true,
  })

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  return (
    <div className="relative">
      {/* Carousel Viewport */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-5">
          {stories.map((story: RugStory) => (
            <LocalizedClientLink
              key={story.id}
              href={`/custom-rugs/${story.slug}`}
              className="group flex-shrink-0 w-[320px] sm:w-[380px] overflow-hidden rounded-2xl bg-white/80 shadow-[0_12px_40px_rgba(0,0,0,0.06)] ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.10)]"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                {story.thumbnail ? (
                  <Image
                    src={story.thumbnail}
                    alt={story.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 320px, 380px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-zinc-100">
                    <span className="text-zinc-400">No image</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="px-6 py-5">
                <h3 className="text-lg font-semibold text-zinc-800 sm:text-xl">
                  {story.title}
                  {story.subtitle && (
                    <span className="text-zinc-600"> — {story.subtitle}</span>
                  )}
                </h3>
                {story.intro_text && (
                  <p className="mt-2 text-[15px] leading-relaxed text-zinc-600 line-clamp-2">
                    {story.intro_text}
                  </p>
                )}
                <p className="mt-3 text-sm text-[#9b8b74] tracking-wide">
                  {[story.size, story.material].filter(Boolean).join(" · ")}
                </p>
              </div>
            </LocalizedClientLink>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-lg ring-1 ring-black/5 text-zinc-600 hover:text-zinc-900 transition-colors z-10"
        aria-label="Previous slide"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-lg ring-1 ring-black/5 text-zinc-600 hover:text-zinc-900 transition-colors z-10"
        aria-label="Next slide"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Gradient Fades */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent hidden sm:block" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent hidden sm:block" />
    </div>
  )
}

// Main wrapper that receives stories as props
export default function StoriesTufted({ stories }: { stories: RugStory[] }) {
  // If no stories, don't render the section
  if (!stories || stories.length === 0) {
    return null
  }

  return (
    <section className="relative w-full overflow-hidden">
      {/* Subtle warm glow accents */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-zinc-100/50 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:py-20">
        {/* Header */}
        <div className="text-center">
          <h2
            className="text-[36px] sm:text-[48px] text-zinc-800"
            style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 600 }}
          >
            Stories We&apos;ve Woven
          </h2>
          <div className="mx-auto mt-3 h-px w-40 bg-gradient-to-r from-transparent via-[#c4a97d] to-transparent" />
          <p className="mt-4 text-base sm:text-lg text-zinc-600">
            A few of our favorite custom rugs, made with craft and love.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative mt-10 sm:mt-12">
          <StoriesCarousel stories={stories} />
        </div>

        {/* Bottom Link */}
        <div className="mt-8 text-center">
          <LocalizedClientLink
            href="/custom-rugs"
            className="inline-flex items-center gap-2 text-[#9B7940] font-medium hover:text-[#866a36] transition-colors"
          >
            View All Stories
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </LocalizedClientLink>
        </div>
      </div>
    </section>
  )
}
