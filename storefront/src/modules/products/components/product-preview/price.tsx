import { Text } from "@medusajs/ui"
import { VariantPrice } from "types/global"

export default function PreviewPrice({ price }: { price: VariantPrice }) {
  if (!price) return null

  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
      <Text className="text-sm font-semibold text-ui-fg-base">
        {price.calculated_price}/-
      </Text>

      {price.price_type === "sale" && (
        <Text className="text-xs line-through text-ui-fg-muted">
          {price.currency_code === "inr" ? "M.R.P.:" : "was"}{" "}
          {price.original_price}
        </Text>
      )}
    </div>
  )
}
