import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "./paginated-products"
import RefinementList from "@modules/store/components/refinement-list"

const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <div
      className="flex flex-col small:flex-row small:items-start py-6 content-container"
      data-testid="category-container"
    >
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <h1
            data-testid="store-page-title"
            className="text-3xl md:text-4xl font-semibold tracking-tight text-ui-fg-base"
          >
            Explore All Rugs
          </h1>

          <p className="mt-2 text-xs md:text-base text-ui-fg-subtle whitespace-nowrap">
            Custom-made • Premium carving • Ships worldwide
          </p>
        </div>
        <RefinementList sortBy={sort} />
        <Suspense fallback={<SkeletonProductGrid />}>
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            countryCode={countryCode}
          />
        </Suspense>
      </div>
    </div>
  )
}

export default StoreTemplate
