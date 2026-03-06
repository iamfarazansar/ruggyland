import { Metadata } from "next"
import Image from "next/image"
import { listRugStories } from "@lib/data/rug-stories"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getAlternates } from "@lib/seo/hreflang"

type Props = { params: Promise<{ countryCode: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { countryCode } = await params
  return {
    title: "Custom Rugs | Our Portfolio | RuggyLand",
    description:
      "Explore our collection of handcrafted custom rugs. Each piece tells a unique story.",
    alternates: getAlternates("/custom-rugs", countryCode),
  }
}

export default async function CustomRugsPage() {
  const { stories } = await listRugStories()

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-24">
        <div className="mx-auto max-w-6xl px-4">
          {/* Back Button - visible on mobile */}
          <LocalizedClientLink
            href="/"
            className="inline-flex items-center text-sm text-[#9b8b74] hover:text-[#866a36] mb-6 sm:mb-8"
          >
            <svg
              className="mr-2 w-4 h-4"
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
            Back to Home
          </LocalizedClientLink>

          <div className="text-center">
            <h1
              className="text-[40px] sm:text-[56px] text-zinc-800"
              style={{
                fontFamily: "'Dancing Script', cursive",
                fontWeight: 600,
              }}
            >
              Stories We&apos;ve Woven
            </h1>
            <div className="mx-auto mt-4 h-px w-48 bg-gradient-to-r from-transparent via-[#c4a97d] to-transparent" />
            <p className="mt-6 text-lg text-zinc-600 max-w-2xl mx-auto">
              Each custom rug has a story behind it. From initial sketches to
              the final masterpiece, explore the journeys we&apos;ve been
              honored to craft.
            </p>
          </div>
        </div>
      </section>

      {/* Stories Grid */}
      <section className="pb-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {stories.map((story) => (
              <LocalizedClientLink
                key={story.id}
                href={`/custom-rugs/${story.slug}`}
                className="group overflow-hidden rounded-2xl bg-white/80 shadow-[0_12px_40px_rgba(0,0,0,0.06)] ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.10)]"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  {story.thumbnail ? (
                    <Image
                      src={story.thumbnail}
                      alt={story.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#ead8c4] to-[#d4c4b0] flex items-center justify-center">
                      <span className="text-[#9b8b74] text-sm">No image</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="px-6 py-5">
                  <h3 className="text-lg font-semibold text-zinc-800 sm:text-xl">
                    {story.title}
                  </h3>
                  {story.subtitle && (
                    <p className="mt-1 text-sm text-[#9b8b74]">
                      {story.subtitle}
                    </p>
                  )}

                  {/* Specs */}
                  <div className="mt-3 flex items-center gap-2 text-sm text-zinc-600">
                    {story.size && <span>{story.size}</span>}
                    {story.size && story.material && <span>·</span>}
                    {story.material && <span>{story.material}</span>}
                  </div>

                  {/* View Story Link */}
                  <div className="mt-4 flex items-center text-sm font-medium text-[#9B7940] group-hover:text-[#866a36]">
                    View Story
                    <svg
                      className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1"
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
                  </div>
                </div>
              </LocalizedClientLink>
            ))}
          </div>

          {stories.length === 0 && (
            <div className="text-center py-16">
              <p className="text-zinc-500">No stories yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
