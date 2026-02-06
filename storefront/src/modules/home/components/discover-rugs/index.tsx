import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

type Props = {
  categories: HttpTypes.StoreProductCategory[]
}

export default function DiscoverRugs({ categories }: Props) {
  const topLevel = (categories || []).filter((c) => !c.parent_category)
  const discover = topLevel.slice(0, 4)

  const imageByHandle: Record<string, string> = {
    "anime-rugs": "/discover/anime.jpg",
    "modern-rugs": "/discover/modern-rugs.jpg",
    "botanical-rugs": "/discover/botanical-rugs.png",
    abstract: "/discover/abstract.png",
  }

  return (
    <section className="w-full">
      {/* textured background strip */}
      <div className="bg-[url('/paper-texture.png')] bg-cover bg-center">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 md:py-14">
          {/* Heading */}
          <div className="text-center">
            <h2 className="text-xl md:text-3xl font-medium tracking-wide">
              Discover Our Rugs
            </h2>
            <p className="mt-2 text-sm md:text-base text-neutral-600">
              Explore our curated rug collections.
            </p>
          </div>

          {/* Tiles */}
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {discover.map((c) => {
              const meta = c.metadata ?? {}
              const img =
                (meta.discover_image as string) ||
                imageByHandle[c.handle ?? ""] ||
                "/discover/default.jpg"

              return (
                <LocalizedClientLink
                  key={c.id}
                  href={`/categories/${c.handle}`}
                  className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  {/* Image */}
                  <div className="relative aspect-square w-full">
                    <Image
                      src={img}
                      alt={c.name ?? "Category"}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      sizes="(max-width: 768px) 50vw, 25vw"
                      priority={false}
                    />
                  </div>

                  {/* dark overlay */}
                  <div className="absolute inset-0 bg-black/35 transition-opacity group-hover:bg-black/45" />

                  {/* text */}
                  <div className="absolute inset-x-0 bottom-0 p-3 md:p-4">
                    <p className="text-white text-sm md:text-base font-semibold drop-shadow">
                      {c.name}
                    </p>
                    <p className="mt-1 text-white/90 text-xs md:text-sm">
                      View Collection <span aria-hidden>→</span>
                    </p>
                  </div>
                </LocalizedClientLink>
              )
            })}
          </div>

          {/* CTA */}
          {/* <div className="mt-8 flex justify-center">
            <LocalizedClientLink
              href="/about#process"
              className="rounded-full border border-neutral-300 bg-white/80 px-6 py-2 text-sm font-medium text-neutral-900 backdrop-blur hover:bg-white"
            >
              Learn About Our Process
            </LocalizedClientLink>
          </div> */}
        </div>
      </div>
    </section>
  )
}
