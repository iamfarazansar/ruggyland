"use client"

import { addToCart } from "@lib/data/cart"
import { trackAddToCart } from "@lib/posthog/events"
import { trackMetaAddToCart } from "@lib/meta-pixel/events"
import { useIntersection } from "@lib/hooks/use-in-view"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import Divider from "@modules/common/components/divider"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import { isEqual } from "lodash"
import {
  useParams,
  usePathname,
  useSearchParams,
  useRouter,
} from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt: any) => {
    acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

export default function ProductActions({
  product,
  disabled,
}: ProductActionsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const countryCode = useParams().countryCode as string

  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isAdding, setIsAdding] = useState(false)

  // ✅ Quantity state
  const [quantity, setQuantity] = useState(1)

  // If there is only 1 variant, preselect the options
  useEffect(() => {
    if (product.variants?.length === 1) {
      const variantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(variantOptions ?? {})
    }
  }, [product.variants])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return
    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({ ...prev, [optionId]: value }))
  }

  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // Keep v_id in url
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    const value = isValidVariant ? selectedVariant?.id : null

    if (params.get("v_id") === value) return

    if (value) params.set("v_id", value)
    else params.delete("v_id")

    router.replace(pathname + "?" + params.toString(), { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVariant, isValidVariant])

  // Reset qty when variant changes
  useEffect(() => {
    setQuantity(1)
  }, [selectedVariant?.id])

  const inStock = useMemo(() => {
    if (selectedVariant && !selectedVariant.manage_inventory) return true
    if (selectedVariant?.allow_backorder) return true
    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true
    }
    return false
  }, [selectedVariant])

  const maxQuantity = useMemo(() => {
    if (!selectedVariant) return 10
    if (!selectedVariant.manage_inventory) return 10
    if (selectedVariant.allow_backorder) return 10
    return Math.max(1, Math.min(10, selectedVariant.inventory_quantity || 1))
  }, [selectedVariant])

  const actionsRef = useRef<HTMLDivElement>(null)
  const inView = useIntersection(actionsRef, "0px")

  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    setIsAdding(true)
    await addToCart({
      variantId: selectedVariant.id,
      quantity,
      countryCode,
    })
    trackAddToCart(product, selectedVariant.id, quantity)
    trackMetaAddToCart(
      product,
      selectedVariant.id,
      quantity,
      selectedVariant.calculated_price?.calculated_amount
        ? Number(selectedVariant.calculated_price.calculated_amount)
        : undefined,
      selectedVariant.calculated_price?.currency_code ?? undefined
    )
    setIsAdding(false)

    // Show the nav bar so user can see cart count updated
    window.dispatchEvent(new Event("show-nav"))
  }

  const qtyDisabled = !!disabled || isAdding || !selectedVariant

  return (
    <div className="flex flex-col gap-y-3" ref={actionsRef}>
      {(product.variants?.length ?? 0) > 0 && (
        <div className="flex flex-col gap-y-4">
          {(product.options || []).map((option) => (
            <div key={option.id}>
              <OptionSelect
                option={option}
                current={options[option.id]}
                updateOption={setOptionValue}
                title={option.title ?? ""}
                data-testid="product-options"
                disabled={!!disabled || isAdding}
              />
            </div>
          ))}
          <Divider />
        </div>
      )}

      <ProductPrice product={product} variant={selectedVariant} />

      {/* ✅ Desktop: Qty pill + Add button (mobile-style) */}
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-xl border border-ui-border-base bg-white overflow-hidden">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={qtyDisabled || quantity <= 1}
            className="h-11 w-11 flex items-center justify-center text-lg text-ui-fg-base disabled:opacity-50"
            aria-label="Decrease quantity"
          >
            −
          </button>

          <span className="min-w-[40px] text-center text-sm font-semibold text-ui-fg-base">
            {quantity}
          </span>

          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
            disabled={qtyDisabled || quantity >= maxQuantity}
            className="h-11 w-11 flex items-center justify-center text-lg text-ui-fg-base disabled:opacity-50"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        <Button
          onClick={handleAddToCart}
          disabled={
            !inStock ||
            !selectedVariant ||
            !!disabled ||
            isAdding ||
            !isValidVariant
          }
          variant="primary"
          className="w-full h-11 rounded-xl"
          isLoading={isAdding}
          data-testid="add-product-button"
        >
          {!selectedVariant
            ? "Select variant"
            : !inStock || !isValidVariant
            ? "Out of stock"
            : "Add to cart"}
        </Button>
      </div>

      {/* ✅ Mobile bar */}
      <MobileActions
        product={product}
        variant={selectedVariant}
        options={options}
        updateOptions={setOptionValue}
        inStock={inStock}
        handleAddToCart={handleAddToCart}
        isAdding={isAdding}
        show={!inView}
        optionsDisabled={!!disabled || isAdding}
        quantity={quantity}
        maxQuantity={maxQuantity}
        onDecQty={() => setQuantity((q) => Math.max(1, q - 1))}
        onIncQty={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
      />
    </div>
  )
}
