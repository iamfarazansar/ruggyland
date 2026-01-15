import { Text, clx } from "@medusajs/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({ product })

  // optional "meta" line (keep simple)
  const metaLine = isFeatured
    ? "Featured • Handmade"
    : "Handmade • Ships in 7-10 days"

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="group block"
      data-testid="product-wrapper"
    >
      <div
        className={clx(
          "rounded-2xl border border-ui-border-base bg-ui-bg-base",
          "overflow-hidden transition-all duration-200",
          "hover:-translate-y-0.5 hover:shadow-elevation-card-hover"
        )}
      >
        {/* Image */}
        <div className="p-3 bg-ui-bg-subtle">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
            isFeatured={isFeatured}
            className={clx(
              "rounded-xl overflow-hidden",
              // keep the aspect ratio consistent for grid
              // If your Thumbnail already sets aspect, this is still fine
              "shadow-elevation-card-rest"
            )}
          />
        </div>

        {/* Text area */}
        <div className="px-4 pb-4 pt-3">
          <div className="flex items-start justify-between gap-3">
            {/* Title */}
            <Text
              className={clx(
                "text-ui-fg-base font-medium",
                "leading-snug line-clamp-2"
              )}
              data-testid="product-title"
            >
              {product.title}
            </Text>

            {/* Price */}
            <div className="shrink-0 text-right">
              {cheapestPrice && (
                <div
                  className={clx(
                    "font-semibold",
                    // makes price feel premium
                    "text-ui-fg-base"
                    // If you want gold accent for price, uncomment:
                    // "text-[rgba(168,124,32,0.95)]"
                  )}
                >
                  <PreviewPrice price={cheapestPrice} />
                </div>
              )}
            </div>
          </div>

          {/* Meta line */}
          <p className="mt-2 text-xs text-ui-fg-subtle">{metaLine}</p>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
