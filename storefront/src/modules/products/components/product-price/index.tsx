import { clx } from "@medusajs/ui"

import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"

export default function ProductPrice({
  product,
  variant,
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
}) {
  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: variant?.id,
  })

  const selectedPrice = variant ? variantPrice : cheapestPrice

  if (!selectedPrice) {
    return <div className="block w-32 h-9 bg-gray-100 animate-pulse" />
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-baseline gap-x-2.5">
        <span
          className="text-2xl font-bold text-ui-fg-base"
          data-testid="product-price"
          data-value={selectedPrice.calculated_price_number}
        >
          {selectedPrice.calculated_price}
        </span>

        {selectedPrice.price_type === "sale" && (
          <span
            className="text-base text-ui-fg-muted line-through"
            data-testid="original-product-price"
            data-value={selectedPrice.original_price_number}
          >
            {selectedPrice.currency_code === "inr" ? "MRP" : "was"}{" "}
            {selectedPrice.original_price}
          </span>
        )}

        <span className="text-sm text-ui-fg-muted">(Incl. of all taxes)</span>
      </div>

      {selectedPrice.price_type === "sale" && (
        <span className="inline-block w-fit rounded-md bg-ui-fg-base px-2.5 py-1 text-xs font-bold text-white">
          {selectedPrice.percentage_diff}% OFF
        </span>
      )}
    </div>
  )
}
