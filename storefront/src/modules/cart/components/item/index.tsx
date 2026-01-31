"use client"

import { Table, Text, clx } from "@medusajs/ui"
import { updateLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import CartItemSelect from "@modules/cart/components/cart-item-select"
import ErrorMessage from "@modules/checkout/components/error-message"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"
import Thumbnail from "@modules/products/components/thumbnail"
import { useState } from "react"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
  currencyCode: string
  layout?: "mobile" | "desktop"
}

const Item = ({
  item,
  type = "full",
  currencyCode,
  layout = "desktop",
}: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const changeQuantity = async (quantity: number) => {
    setError(null)
    setUpdating(true)

    await updateLineItem({
      lineId: item.id,
      quantity,
    })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setUpdating(false)
      })
  }

  const maxQtyFromInventory = 10
  const maxQuantity = item.variant?.manage_inventory ? 10 : maxQtyFromInventory

  // Mobile layout using flex
  if (layout === "mobile") {
    return (
      <div
        className="py-4 border-b border-ui-border-base"
        data-testid="product-row"
      >
        {/* Main row: Image + Product Info + Total */}
        <div className="flex gap-3">
          {/* Product Image */}
          <LocalizedClientLink
            href={`/products/${item.product_handle}`}
            className="shrink-0"
          >
            <div className="w-16 h-16 rounded-md overflow-hidden">
              <Thumbnail
                thumbnail={item.thumbnail}
                images={item.variant?.product?.images}
                size="square"
              />
            </div>
          </LocalizedClientLink>

          {/* Product Details */}
          <div className="flex-1 min-w-0 flex justify-between items-center">
            <div className="min-w-0 flex-1">
              <Text
                className="txt-medium-plus text-ui-fg-base truncate block"
                data-testid="product-title"
              >
                {item.product_title}
              </Text>
              <div className="text-ui-fg-muted text-small-regular">
                <LineItemOptions
                  variant={item.variant}
                  data-testid="product-variant"
                />
              </div>
              {/* Price + Delete + Quantity in one row */}
              <div className="mt-1 flex items-center gap-2 flex-wrap">
                <span className="text-ui-fg-muted text-small-regular">
                  Price:
                </span>
                <LineItemUnitPrice
                  item={item}
                  style="tight"
                  currencyCode={currencyCode}
                />
                {type === "full" && (
                  <>
                    <span className="text-ui-fg-muted">•</span>
                    <DeleteButton
                      id={item.id}
                      data-testid="product-delete-button-mobile"
                    />
                    <CartItemSelect
                      value={item.quantity}
                      max={Math.min(maxQuantity, 10)}
                      disabled={updating}
                      onChange={(newQty) => changeQuantity(newQty)}
                    />
                    {updating && <Spinner className="w-4 h-4" />}
                  </>
                )}
              </div>
            </div>
            {/* Total on right - vertically centered */}
            <div className="text-right shrink-0 txt-medium-plus font-semibold">
              <LineItemPrice
                item={item}
                style="tight"
                currencyCode={currencyCode}
              />
            </div>
          </div>
        </div>
        {error && (
          <ErrorMessage
            error={error}
            data-testid="product-error-message-mobile"
          />
        )}
      </div>
    )
  }

  // Desktop layout using table row
  return (
    <Table.Row
      className="w-full hover:bg-ui-bg-subtle-hover rounded-lg"
      data-testid="product-row"
    >
      <Table.Cell className="py-4 px-3 w-28 align-top first:rounded-l-lg">
        <LocalizedClientLink
          href={`/products/${item.product_handle}`}
          className="block w-24"
        >
          <Thumbnail
            thumbnail={item.thumbnail}
            images={item.variant?.product?.images}
            size="square"
          />
        </LocalizedClientLink>
      </Table.Cell>

      <Table.Cell className="text-left align-top py-4 px-2">
        <Text
          className="txt-medium-plus text-ui-fg-base"
          data-testid="product-title"
        >
          {item.product_title}
        </Text>
        <LineItemOptions variant={item.variant} data-testid="product-variant" />
        {/* Price below variant */}
        <div className="mt-1 flex items-center gap-1">
          <span className="text-ui-fg-muted text-small-regular">Price:</span>
          <LineItemUnitPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </div>
      </Table.Cell>

      {type === "full" && (
        <Table.Cell className="align-top py-4 px-2 text-center">
          <div className="flex items-center justify-center gap-2">
            <DeleteButton id={item.id} data-testid="product-delete-button" />
            <CartItemSelect
              value={item.quantity}
              max={Math.min(maxQuantity, 10)}
              disabled={updating}
              onChange={(newQty) => changeQuantity(newQty)}
            />
            {updating && <Spinner className="w-4 h-4" />}
          </div>
          <ErrorMessage error={error} data-testid="product-error-message" />
        </Table.Cell>
      )}

      <Table.Cell className="align-top text-right py-4 px-3 last:rounded-r-lg">
        <span
          className={clx("block text-right", {
            "flex flex-col items-end h-full justify-center": type === "preview",
          })}
        >
          {type === "preview" && (
            <span className="flex gap-x-1">
              <Text className="text-ui-fg-muted">{item.quantity}x </Text>
              <LineItemUnitPrice
                item={item}
                style="tight"
                currencyCode={currencyCode}
              />
            </span>
          )}
          <LineItemPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </span>
      </Table.Cell>
    </Table.Row>
  )
}

export default Item
