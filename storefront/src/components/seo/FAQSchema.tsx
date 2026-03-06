// FAQ data exported for both UI rendering and JSON-LD schema generation
export const FAQ_DATA = [
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
    answer:
      "Yes, we use AI to enhance the backgrounds of our rug photos to create a more aesthetic and immersive setting. However, the rug itself is 100% real — captured exactly as it was handcrafted. We use AI solely to elevate the environment, ensuring the focus remains on the texture and detail of our work. You can also find the original, unedited photos of each rug in the product image gallery.",
  },
]

export default function FAQSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_DATA.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
