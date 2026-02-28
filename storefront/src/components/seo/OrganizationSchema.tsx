export default function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "RuggyLand",
    url: "https://www.ruggyland.com",
    logo: "https://www.ruggyland.com/ruggyland-logo.svg",
    description:
      "Premium handcrafted rugs made to order. Custom tufted designs, anime rugs, botanical patterns, and hand-knotted carpets — shipped worldwide.",
    sameAs: ["https://www.instagram.com/ruggyland/"],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      url: "https://www.ruggyland.com/us/contact-us",
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
