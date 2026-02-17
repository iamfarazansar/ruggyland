import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import InfiniteProductGrid from "@modules/store/components/infinite-product-grid"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
}

export default async function PaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  productsIds,
  countryCode,
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  countryCode: string
}) {
  const queryParams: PaginatedProductsParams = {
    limit: 100,
  }

  if (collectionId) {
    queryParams["collection_id"] = [collectionId]
  }

  if (categoryId) {
    queryParams["category_id"] = [categoryId]
  }

  if (productsIds) {
    queryParams["id"] = productsIds
  }

  if (sortBy === "created_at") {
    queryParams["order"] = "created_at"
  }

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  let {
    response: { products },
  } = await listProductsWithSort({
    page: 1,
    queryParams,
    sortBy,
    countryCode,
  })

  return (
    <InfiniteProductGrid>
      {products.map((p) => {
        return (
          <li key={p.id}>
            <ProductPreview product={p} region={region} />
          </li>
        )
      })}
    </InfiniteProductGrid>
  )
}
