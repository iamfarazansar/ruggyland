import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCategoryByHandle, listCategories } from "@lib/data/categories"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import CategoryTemplate from "@modules/categories/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getAlternates } from "@lib/seo/hreflang"

type Props = {
  params: Promise<{ category: string[]; countryCode: string }>
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
  }>
}

// Pre-generate only one representative country per region to keep builds fast.
const STATIC_COUNTRY_CODES = ["in", "us", "gb", "de", "ae"]

export async function generateStaticParams() {
  const product_categories = await listCategories()

  if (!product_categories) {
    return []
  }

  const categoryHandles = product_categories.map(
    (category: any) => category.handle
  )

  return STATIC_COUNTRY_CODES.flatMap((countryCode) =>
    categoryHandles.map((handle: any) => ({
      countryCode,
      category: [handle],
    }))
  )
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  try {
    const productCategory = await getCategoryByHandle(params.category)

    const title = productCategory.name + " | RuggyLand Store"

    // Use admin description if it's long enough for a good meta description (80+ chars),
    // otherwise generate a descriptive one
    const adminDesc = productCategory.description || ""
    const description =
      adminDesc.length >= 80
        ? adminDesc.slice(0, 155)
        : `Shop ${
            productCategory.name
          } at RuggyLand — handcrafted premium rugs made to order. ${
            adminDesc ? adminDesc + " " : ""
          }Browse our collection and get free worldwide shipping.`

    return {
      title: `${productCategory.name} | RuggyLand`,
      description: description.slice(0, 160),
      alternates: getAlternates(
        `/categories/${params.category.join("/")}`,
        params.countryCode
      ),
    }
  } catch (error) {
    notFound()
  }
}

export default async function CategoryPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { sortBy, page } = searchParams

  const productCategory = await getCategoryByHandle(params.category)

  if (!productCategory) {
    notFound()
  }

  return (
    <CategoryTemplate
      category={productCategory}
      sortBy={sortBy}
      page={page}
      countryCode={params.countryCode}
    />
  )
}
