import { notFound } from "next/navigation"
import { Suspense } from "react"

import InteractiveLink from "@modules/common/components/interactive-link"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import MobileBackButton from "@modules/common/components/mobile-back-button"
import { HttpTypes } from "@medusajs/types"

export default function CategoryTemplate({
  category,
  sortBy,
  page,
  countryCode,
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  if (!category || !countryCode) notFound()

  const parents = [] as HttpTypes.StoreProductCategory[]

  const getParents = (category: HttpTypes.StoreProductCategory) => {
    if (category.parent_category) {
      parents.push(category.parent_category)
      getParents(category.parent_category)
    }
  }

  getParents(category)

  return (
    <div
      className="flex flex-col py-6 content-container"
      data-testid="category-container"
    >
      {/* Mobile Back Button */}
      <MobileBackButton />

      <div className="w-full">
        <div className="mb-8">
          {/* Breadcrumb */}
          {parents?.length > 0 && (
            <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ui-fg-subtle">
              {parents
                .slice()
                .reverse()
                .map((parent, idx) => (
                  <span key={parent.id} className="flex items-center gap-x-2">
                    <LocalizedClientLink
                      className="hover:text-ui-fg-base transition"
                      href={`/categories/${parent.handle}`}
                    >
                      {parent.name}
                    </LocalizedClientLink>
                    {idx !== parents.length - 1 && <span>/</span>}
                  </span>
                ))}
            </div>
          )}

          {/* Title (same as store page) */}
          <h1
            data-testid="category-page-title"
            className="text-3xl md:text-4xl font-semibold tracking-tight text-ui-fg-base"
          >
            {category.name}
          </h1>

          {/* Description / fallback tagline (same as store page) */}
          <p className="mt-2 text-xs md:text-base text-ui-fg-subtle whitespace-nowrap">
            {category.description ||
              "Custom-made • Premium carving • Ships worldwide"}
          </p>
        </div>

        {/* Sort */}
        <RefinementList sortBy={sort} data-testid="sort-by-container" />

        <Suspense
          fallback={
            <SkeletonProductGrid
              numberOfProducts={category.products?.length ?? 8}
            />
          }
        >
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            categoryId={category.id}
            countryCode={countryCode}
          />
        </Suspense>
      </div>
    </div>
  )
}
