import { Metadata } from "next"
import { notFound } from "next/navigation"
import { listProducts } from "@lib/data/products"
import { getRegion, listRegions } from "@lib/data/regions"
import ProductTemplate from "@modules/products/templates"
import { HttpTypes } from "@medusajs/types"
import { getAlternates } from "@lib/seo/hreflang"
import ProductSchema from "@components/seo/ProductSchema"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
  searchParams: Promise<{ v_id?: string }>
}

// Pre-generate only one representative country per region to keep builds fast.
// All other country codes render on-demand (ISR) with no performance difference.
const STATIC_COUNTRY_CODES = ["in", "us", "gb", "de", "ae"]

export async function generateStaticParams() {
  try {
    const promises = STATIC_COUNTRY_CODES.map(async (country) => {
      const { response } = await listProducts({
        countryCode: country,
        queryParams: { limit: 100, fields: "handle" },
      })

      return {
        country,
        products: response.products,
      }
    })

    const countryProducts = await Promise.all(promises)

    return countryProducts
      .flatMap((countryData) =>
        countryData.products.map((product) => ({
          countryCode: countryData.country,
          handle: product.handle,
        }))
      )
      .filter((param) => param.handle)
  } catch (error) {
    console.error(
      `Failed to generate static paths for product pages: ${
        error instanceof Error ? error.message : "Unknown error"
      }.`
    )
    return []
  }
}

function getImagesForVariant(
  product: HttpTypes.StoreProduct,
  selectedVariantId?: string
) {
  if (!selectedVariantId || !product.variants) {
    return product.images
  }

  const variant = product.variants!.find((v) => v.id === selectedVariantId)
  if (!variant || !variant.images?.length) {
    return product.images
  }

  const imageIdsMap = new Map(variant.images.map((i) => [i.id, true]))
  return product.images?.filter((i) => imageIdsMap.has(i.id)) ?? null
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { handle } = params
  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  const product = await listProducts({
    countryCode: params.countryCode,
    queryParams: { handle },
  }).then(({ response }) => response.products[0])

  if (!product) {
    notFound()
  }

  const description = product.description
    ? product.description.slice(0, 155)
    : `${product.title} — handcrafted rug made to order by RuggyLand. Custom sizes available, shipped worldwide.`

  return {
    title: `${product.title} | RuggyLand`,
    description,
    alternates: getAlternates(`/products/${handle}`),
    openGraph: {
      title: `${product.title} | RuggyLand`,
      description,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
  }
}

export default async function ProductPage(props: Props) {
  const params = await props.params
  const region = await getRegion(params.countryCode)
  const searchParams = await props.searchParams

  const selectedVariantId = searchParams.v_id

  if (!region) {
    notFound()
  }

  const pricedProduct = await listProducts({
    countryCode: params.countryCode,
    queryParams: { handle: params.handle },
  }).then(({ response }) => response.products[0])

  if (!pricedProduct) {
    notFound()
  }

  const images = getImagesForVariant(pricedProduct, selectedVariantId)

  // Get lowest variant price for schema
  const firstVariant = pricedProduct.variants?.[0]
  const schemaPrice = firstVariant?.calculated_price?.calculated_amount ?? undefined
  const schemaCurrency = region.currency_code ?? undefined

  return (
    <>
      <ProductSchema
        product={pricedProduct}
        countryCode={params.countryCode}
        price={schemaPrice ?? undefined}
        currencyCode={schemaCurrency}
      />
      <ProductTemplate
        product={pricedProduct}
        region={region}
        countryCode={params.countryCode}
        images={images ?? pricedProduct.images ?? []}
      />
    </>
  )
}
