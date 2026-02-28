import { HttpTypes } from "@medusajs/types"

type Props = {
  product: HttpTypes.StoreProduct
  countryCode: string
  price?: number
  currencyCode?: string
}

export default function ProductSchema({ product, countryCode, price, currencyCode }: Props) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description || product.title,
    image: product.images?.map((i) => i.url).filter(Boolean) || [],
    brand: {
      "@type": "Brand",
      name: "RuggyLand",
    },
    url: `https://www.ruggyland.com/${countryCode}/products/${product.handle}`,
    ...(price && currencyCode
      ? {
          offers: {
            "@type": "Offer",
            price: price.toFixed(2),
            priceCurrency: currencyCode.toUpperCase(),
            availability: "https://schema.org/InStock",
            url: `https://www.ruggyland.com/${countryCode}/products/${product.handle}`,
            seller: {
              "@type": "Organization",
              name: "RuggyLand",
            },
          },
        }
      : {}),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
