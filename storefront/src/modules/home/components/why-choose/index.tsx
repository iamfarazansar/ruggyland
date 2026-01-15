// app/components/WhyChooseRuggyLand.tsx
// (Works in Next.js + Tailwind without SVGR. Put your svgs in /public/why/ e.g. /public/why/love.svg)

type WhyItem = {
  title: string
  description: string
  iconSrc: string
  iconAlt: string
}

const items: WhyItem[] = [
  {
    title: "Handcrafted Quality",
    description:
      "Each rug is hand-tufted by skilled artisans — never mass-produced.",
    iconSrc: "/why/love.svg",
    iconAlt: "Handcrafted quality",
  },
  {
    title: "Made Just for You",
    description: "Custom sizes, colors, and designs tailored to your space.",
    iconSrc: "/why/frame.svg",
    iconAlt: "Made just for you",
  },
  {
    title: "Premium Materials",
    description: "High-quality yarns and backing for comfort and durability.",
    iconSrc: "/why/wool.svg",
    iconAlt: "Premium materials",
  },
  {
    title: "Precision Finishing",
    description: "Hand-carved details and clean edges for a refined look.",
    iconSrc: "/why/scissor.svg",
    iconAlt: "Precision finishing",
  },
  {
    title: "Worldwide Shipping",
    description: "Secure packaging and reliable global delivery.",
    iconSrc: "/why/ship.svg",
    iconAlt: "Worldwide shipping",
  },
  {
    title: "Crafted with Care",
    description:
      "Clear communication, honest timelines, and quality you can trust.",
    iconSrc: "/why/tufting.svg",
    iconAlt: "Crafted with care",
  },
]

export default function WhyChooseRuggyLand() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* soft top glow like your mock */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48" />

      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <div className="text-center">
          <h2 className="text-[28px] sm:text-[34px] font-medium tracking-[0.18em] text-zinc-800">
            WHY CHOOSE RUGGYLAND
          </h2>
          <p className="mt-3 text-base sm:text-lg text-zinc-600">
            Thoughtfully handcrafted rugs, made to last.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {items.map((item) => (
            <div
              key={item.title}
              className="group rounded-2xl bg-white/70 px-7 py-9 shadow-[0_18px_45px_rgba(0,0,0,0.06)] ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(0,0,0,0.08)]"
            >
              <div className="flex justify-center">
                <div className="grid h-24 w-24 place-items-center">
                  <img
                    src={item.iconSrc}
                    alt={item.iconAlt}
                    className="h-24 w-24 opacity-90 transition-opacity duration-200 group-hover:opacity-100"
                    loading="lazy"
                  />
                </div>
              </div>

              <h3 className="mt-6 text-center font-serif text-xl sm:text-[22px] text-zinc-800">
                {item.title}
              </h3>

              <p className="mx-auto mt-3 max-w-[26ch] text-center text-[15px] leading-6 text-zinc-600">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
