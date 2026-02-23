"use client"

import { addToCart } from "@lib/data/cart"
import { trackAddToCart } from "@lib/posthog/events"
import {
  trackMetaAddToCart,
  trackMetaViewContent,
} from "@lib/meta-pixel/events"
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
  const [isBuyingNow, setIsBuyingNow] = useState(false)

  // ✅ Quantity state
  const [quantity, setQuantity] = useState(1)

  // Auto-select first option values on page load (only once)
  const hasInitialized = useRef(false)
  useEffect(() => {
    if (hasInitialized.current) return
    if (!product.variants?.length || !product.options?.length) return

    hasInitialized.current = true

    // Sort variants: first shape first, then smallest size
    const shapeOpt = (product.options || []).find(
      (o) => o.title?.toLowerCase() === "shape"
    )
    const shapeValues = shapeOpt
      ? (shapeOpt.values ?? []).map((v: any) => v.value)
      : []

    const parseArea = (variant: any) => {
      const opts = optionsAsKeymap(variant.options) || {}
      for (const val of Object.values(opts)) {
        const match = (val as string)?.match(
          /(\d+\.?\d*)\s*[x×]\s*(\d+\.?\d*)/i
        )
        if (match) return parseFloat(match[1]) * parseFloat(match[2])
      }
      return 9999
    }

    const getShapeIdx = (variant: any) => {
      if (!shapeOpt) return 0
      const opts = optionsAsKeymap(variant.options) || {}
      const idx = shapeValues.indexOf(opts[shapeOpt.id])
      return idx === -1 ? 999 : idx
    }

    const sortedVariants = [...product.variants]
      .filter((v) => {
        const opts = optionsAsKeymap(v.options) || {}
        return !Object.values(opts).some((val) =>
          (val as string)?.toLowerCase().includes("sample")
        )
      })
      .sort((a, b) => {
        const shapeDiff = getShapeIdx(a) - getShapeIdx(b)
        if (shapeDiff !== 0) return shapeDiff
        return parseArea(a) - parseArea(b)
      })

    const firstVariant = sortedVariants[0] || product.variants[0]

    if (firstVariant) {
      const variantOptions = optionsAsKeymap(firstVariant.options)
      setOptions(variantOptions ?? {})
    }
  }, [product.variants, product.options])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return
    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // Compute available values for each option based on other selected options
  // Shape always shows ALL values; Size is filtered by selected Shape only
  const getAvailableValues = useMemo(() => {
    const result: Record<string, string[]> = {}

    // Find the shape option ID so we know which option is the "parent"
    const shapeOption = (product.options || []).find(
      (o) => o.title?.toLowerCase() === "shape"
    )

    ;(product.options || []).forEach((option) => {
      const isShapeOption = option.id === shapeOption?.id

      // Shape always shows all values — it's the parent selector
      if (isShapeOption) {
        const allVals = new Set<string>()
        ;(product.variants || []).forEach((variant) => {
          const variantOpts = optionsAsKeymap(variant.options) || {}
          if (variantOpts[option.id]) {
            allVals.add(variantOpts[option.id])
          }
        })
        result[option.id] = Array.from(allVals)
        return
      }

      // For other options (like Size), filter based on Shape selection only
      const matchingVariants = (product.variants || []).filter((variant) => {
        const variantOpts = optionsAsKeymap(variant.options) || {}
        // Only filter by shape, not by other child options
        if (shapeOption && options[shapeOption.id]) {
          return variantOpts[shapeOption.id] === options[shapeOption.id]
        }
        return true
      })

      const availableVals = new Set<string>()
      matchingVariants.forEach((variant) => {
        const variantOpts = optionsAsKeymap(variant.options) || {}
        if (variantOpts[option.id]) {
          availableVals.add(variantOpts[option.id])
        }
      })

      result[option.id] = Array.from(availableVals)
    })

    return result
  }, [product.options, product.variants, options])

  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => {
      const newOptions = { ...prev, [optionId]: value }

      // When changing shape, auto-select the smallest available size
      ;(product.options || []).forEach((opt) => {
        if (opt.id === optionId) return
        const currentVal = prev[opt.id]

        // Check if the current value is still valid given the new selection
        const matchingVariants = (product.variants || []).filter((variant) => {
          const variantOpts = optionsAsKeymap(variant.options) || {}
          return Object.entries(newOptions).every(([oId, oVal]) => {
            if (oId === opt.id) return true
            if (!oVal) return true
            return variantOpts[oId] === oVal
          })
        })

        const stillAvailable =
          currentVal &&
          matchingVariants.some((variant) => {
            const variantOpts = optionsAsKeymap(variant.options) || {}
            return variantOpts[opt.id] === currentVal
          })

        if (!stillAvailable) {
          // Auto-select the smallest non-sample size instead of clearing
          const availableVals: { value: string; area: number }[] = []
          matchingVariants.forEach((variant) => {
            const variantOpts = optionsAsKeymap(variant.options) || {}
            const val = variantOpts[opt.id]
            if (!val) return
            if (val.toLowerCase().includes("sample")) return
            const match = val.match(/(\d+\.?\d*)\s*[x×]\s*(\d+\.?\d*)/i)
            const area = match
              ? parseFloat(match[1]) * parseFloat(match[2])
              : 9999
            if (!availableVals.find((v) => v.value === val)) {
              availableVals.push({ value: val, area })
            }
          })
          availableVals.sort((a, b) => a.area - b.area)
          newOptions[opt.id] = availableVals[0]?.value
        }
      })

      return newOptions
    })
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

  // Fire ViewContent on page load (first variant) and on variant change
  const lastTrackedVariantId = useRef<string | null>(null)
  useEffect(() => {
    if (selectedVariant) {
      if (lastTrackedVariantId.current === selectedVariant.id) return
      trackMetaViewContent({
        ...product,
        variants: [selectedVariant],
      })
      lastTrackedVariantId.current = selectedVariant.id
    } else if (!lastTrackedVariantId.current && product.variants?.length) {
      // No variant selected yet (multi-variant product) — fire with first variant
      trackMetaViewContent({
        ...product,
        variants: [product.variants[0]],
      })
      lastTrackedVariantId.current = product.variants[0].id
    }
  }, [selectedVariant?.id])

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

  const handleBuyNow = async () => {
    if (!selectedVariant?.id) return null

    setIsBuyingNow(true)
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
    router.push(`/${countryCode}/checkout`)
  }

  const qtyDisabled = !!disabled || isAdding || isBuyingNow || !selectedVariant

  return (
    <div className="flex flex-col gap-y-3" ref={actionsRef}>
      {(product.variants?.length ?? 0) > 0 && (
        <div className="flex flex-col gap-y-4">
          {(product.options || [])
            .slice()
            .sort((a, b) => {
              // Put Shape before Size so user picks shape first
              const order = ["shape", "size"]
              const ai = order.indexOf((a.title || "").toLowerCase())
              const bi = order.indexOf((b.title || "").toLowerCase())
              return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
            })
            .map((option) => (
              <div key={option.id}>
                <OptionSelect
                  option={option}
                  current={options[option.id]}
                  updateOption={setOptionValue}
                  title={option.title ?? ""}
                  data-testid="product-options"
                  disabled={!!disabled || isAdding}
                  availableValues={getAvailableValues[option.id]}
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
            isBuyingNow ||
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

      {/* Buy Now button */}
      <Button
        onClick={handleBuyNow}
        disabled={
          !inStock ||
          !selectedVariant ||
          !!disabled ||
          isAdding ||
          isBuyingNow ||
          !isValidVariant
        }
        variant="secondary"
        className="w-full h-11 rounded-xl border-2 border-ui-fg-base font-semibold"
        isLoading={isBuyingNow}
        data-testid="buy-now-button"
      >
        {!selectedVariant
          ? "Select variant"
          : !inStock || !isValidVariant
          ? "Out of stock"
          : "Buy now"}
      </Button>

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
        availableValues={getAvailableValues}
      />
    </div>
  )
}
