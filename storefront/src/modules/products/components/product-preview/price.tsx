import { Text, clx } from "@medusajs/ui"
import { VariantPrice } from "types/global"

export default function PreviewPrice({ price }: { price: VariantPrice }) {
  if (!price) return null

  return (
    <div className="flex items-center gap-2">
      {price.price_type === "sale" && (
        <Text className="text-xs line-through text-ui-fg-muted">
          {price.original_price}
        </Text>
      )}

      <Text
        className={clx(
          "font-semibold text-sm text-ui-fg-base",
          price.price_type === "sale" && "text-ui-fg-interactive"
        )}
      >
        {price.calculated_price}
      </Text>
    </div>
  )
}
