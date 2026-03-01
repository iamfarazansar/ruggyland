"use client"

import { useState } from "react"

type FAQItem = {
  question: string
  answer: React.ReactNode
}

const faqs: FAQItem[] = [
  {
    question: "How long does it take to make a custom rug?",
    answer:
      "The timeline for a custom rug typically ranges from 2 to 4 weeks depending on the complexity of the design, size, and current order volume. We'll provide a more accurate estimate when you receive your free quotation.",
  },
  {
    question: "What materials do you use?",
    answer:
      "We primarily use 100% premium New Zealand wool for its superior softness, durability, and vibrant color retention. We also offer acrylic yarn options for those looking for a different texture or a more budget-friendly alternative.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "Yes! We ship our custom rugs worldwide. Shipping costs and delivery times vary depending on your location, which will be detailed in your final invoice.",
  },
  {
    question: "How do I care for and clean my tufted rug?",
    answer:
      "For regular maintenance, vacuum your rug gently using a suction-only setting (avoid beater bars). For spills, blot immediately with a clean, dry cloth — do not rub. For deep cleaning, we recommend professional rug cleaning services.",
  },
  {
    question: "Can you turn any picture into a rug?",
    answer:
      "We can turn almost any clear image, logo, or concept into a rug! Highly detailed or photorealistic images may need to be slightly simplified into a stylized, tuft-friendly design. We always share a mockup for your approval before production begins.",
  },
  {
    question: "Do you accept returns on custom orders?",
    answer:
      "Because custom rugs are made uniquely for you, we cannot accept returns or exchanges. However, we ensure you are involved in the design process and approve the artwork before we start, ensuring you get exactly what you envisioned.",
  },
  {
    question: "Are your product images AI generated?",
    answer: (
      <>
        Yes, we use AI to enhance the backgrounds of our rug photos to create a
        more aesthetic and immersive setting. However, the rug itself is 100%
        real — captured exactly as it was handcrafted. We use AI solely to
        elevate the environment, ensuring the focus remains on the texture and
        detail of our work. You can also find the original, unedited photos of
        each rug — without any background enhancements — right in the product
        image gallery (just scroll through the thumbnails). If you&apos;d like
        to see the authentic, raw process and behind-the-scenes content, please
        visit our{" "}
        <a
          href="https://www.instagram.com/ruggyland/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-800 underline underline-offset-2 hover:text-zinc-600"
        >
          Instagram @ruggyland
        </a>
        . We believe in transparency and love showing the real craftsmanship
        that goes into every single tuft!
      </>
    ),
  },
]

function FAQItem({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-zinc-200 last:border-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
        aria-expanded={isOpen}
      >
        <span className="text-[15px] font-medium text-zinc-800">
          {item.question}
        </span>
        <span className="flex-shrink-0 text-zinc-400 transition-transform duration-200" style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? "600px" : "0px", opacity: isOpen ? 1 : 0 }}
      >
        <p className="pb-5 text-sm leading-relaxed text-zinc-500">
          {item.answer}
        </p>
      </div>
    </div>
  )
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i)

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
      <div className="text-center mb-10 sm:mb-12">
        <h2 className="text-[17px] tracking-[0.06em] sm:text-[34px] sm:tracking-[0.18em] font-medium text-zinc-800 whitespace-nowrap">
          FREQUENTLY ASKED QUESTIONS
        </h2>
        <p className="mt-3 text-base sm:text-lg text-zinc-600">
          Everything you need to know about ordering from RuggyLand.
        </p>
      </div>

      <div className="mx-auto max-w-3xl rounded-2xl bg-white/70 px-7 shadow-[0_18px_45px_rgba(0,0,0,0.06)] ring-1 ring-black/5">
        {faqs.map((item, i) => (
          <FAQItem
            key={i}
            item={item}
            isOpen={openIndex === i}
            onToggle={() => toggle(i)}
          />
        ))}
      </div>
    </section>
  )
}
