import { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import { getRugStory, listRugStories } from "@lib/data/rug-stories"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

// Force dynamic rendering to avoid build-time API calls
export const dynamic = "force-dynamic"

type Props = {
  params: Promise<{ slug: string; countryCode: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const story = await getRugStory(slug)

  if (!story) {
    return {
      title: "Story Not Found",
    }
  }

  return {
    title: `${story.title} | Custom Rug Story`,
    description:
      story.intro_text || `Explore the crafting journey of ${story.title}`,
    openGraph: {
      images: story.thumbnail ? [story.thumbnail] : [],
    },
  }
}

// Return empty array - pages will be generated on-demand
export async function generateStaticParams() {
  return []
}

export default async function RugStoryPage({ params }: Props) {
  const { slug } = await params
  const story = await getRugStory(slug)

  if (!story) {
    notFound()
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-20">
        <div className="mx-auto max-w-5xl px-4">
          {/* Back Link */}
          <LocalizedClientLink
            href="/custom-rugs"
            className="inline-flex items-center text-sm text-[#9b8b74] hover:text-[#866a36] mb-8"
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
            Back to Stories
          </LocalizedClientLink>

          {/* Title Section */}
          <div className="text-center mb-10">
            <h1
              className="text-[28px] sm:text-[48px] text-zinc-800 whitespace-nowrap"
              style={{
                fontFamily: "'Dancing Script', cursive",
                fontWeight: 600,
              }}
            >
              {story.title}
            </h1>
            {story.subtitle && (
              <p className="mt-2 text-lg text-[#9b8b74]">{story.subtitle}</p>
            )}
          </div>

          {/* Main Image */}
          {story.thumbnail && (
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5 mb-8">
              <Image
                src={story.thumbnail}
                alt={story.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 960px"
              />
            </div>
          )}

          {/* Specs Bar */}
          <div className="flex flex-wrap items-center justify-center gap-6 py-6 border-y border-[#e5ddd4]">
            {story.size && (
              <div className="flex items-center gap-2 text-zinc-700">
                <svg
                  className="w-5 h-5 text-[#9b8b74]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                </svg>
                <span className="text-sm">
                  Size: <strong>{story.size}</strong>
                </span>
              </div>
            )}
            {story.material && (
              <div className="flex items-center gap-2 text-zinc-700">
                <svg
                  className="w-5 h-5 text-[#9b8b74]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                  />
                </svg>
                <span className="text-sm">
                  Material: <strong>{story.material}</strong>
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Crafting Journey Section */}
      {story.steps && story.steps.length > 0 && (
        <section className="py-12 sm:py-20">
          <div className="mx-auto max-w-5xl px-4">
            {/* Section Header */}
            <div className="text-center mb-12">
              <h2
                className="text-[28px] sm:text-[36px] text-zinc-800"
                style={{
                  fontFamily: "'Dancing Script', cursive",
                  fontWeight: 600,
                }}
              >
                From Vision to Masterpiece
              </h2>
              <div className="mx-auto mt-3 h-px w-40 bg-gradient-to-r from-transparent via-[#c4a97d] to-transparent" />
              {story.intro_text && (
                <p className="mt-4 text-base text-zinc-600 max-w-2xl mx-auto">
                  {story.intro_text}
                </p>
              )}
            </div>

            {/* Steps */}
            <div className="space-y-16">
              {story.steps.map((step, index) => (
                <div
                  key={index}
                  className={`flex flex-col gap-8 ${
                    index % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"
                  } items-center`}
                >
                  {/* Image */}
                  {step.image_url && (
                    <div className="w-full lg:w-1/2">
                      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5">
                        <Image
                          src={step.image_url}
                          alt={step.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 100vw, 480px"
                        />
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className={`w-full ${step.image_url ? "lg:w-1/2" : ""}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#9B7940] text-white text-sm font-semibold">
                        {index + 1}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-semibold text-zinc-800">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-zinc-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-white/50">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800">
            Want Your Own Custom Rug?
          </h2>
          <p className="mt-3 text-zinc-600">
            Let us create something unique just for you.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <LocalizedClientLink
              href="/custom-rug"
              className="inline-flex items-center justify-center rounded-xl bg-[#9B7940] px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#866a36] hover:shadow-md"
            >
              Start Your Custom Rug
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/custom-rugs"
              className="inline-flex items-center justify-center rounded-xl border border-[#9B7940] px-8 py-3.5 text-sm font-semibold text-[#9B7940] transition-all duration-200 hover:bg-[#9B7940]/5"
            >
              View More Stories
            </LocalizedClientLink>
          </div>
        </div>
      </section>
    </div>
  )
}
