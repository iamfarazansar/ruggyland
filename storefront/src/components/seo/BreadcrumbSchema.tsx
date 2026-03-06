import { HttpTypes } from "@medusajs/types"

type Props = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

export default function BreadcrumbSchema({ product, countryCode }: Props) {
  const baseUrl = "https://www.ruggyland.com"
  const category = product.categories?.[0]

  const items: Array<{ name: string; url: string }> = [
    { name: "Home", url: `${baseUrl}/${countryCode}` },
  ]

  if (category) {
    items.push({
      name: category.name,
      url: `${baseUrl}/${countryCode}/categories/${category.handle}`,
    })
  }

  items.push({
    name: product.title || "Product",
    url: `${baseUrl}/${countryCode}/products/${product.handle}`,
  })

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
