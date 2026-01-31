import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"
import { Table } from "@medusajs/ui"

import Item from "@modules/cart/components/item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"

type ItemsTemplateProps = {
  cart?: HttpTypes.StoreCart
}

const ItemsTemplate = ({ cart }: ItemsTemplateProps) => {
  const items = cart?.items

  const sortedItems = items?.sort((a, b) => {
    return (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
  })

  return (
    <div>
      {/* Mobile: Flex-based layout */}
      <div className="small:hidden">
        <div className="flex justify-between text-ui-fg-subtle txt-medium-plus py-2 border-b border-ui-border-base">
          <span>Item</span>
          <span>Total</span>
        </div>
        {sortedItems
          ? sortedItems.map((item) => (
              <Item
                key={item.id}
                item={item}
                currencyCode={cart?.currency_code ?? ""}
                layout="mobile"
              />
            ))
          : repeat(5).map((i) => <SkeletonLineItem key={i} />)}
      </div>

      {/* Desktop: Table layout */}
      <div className="hidden small:block">
        <Table className="w-full">
          <Table.Header className="border-t-0">
            <Table.Row className="text-ui-fg-subtle txt-medium-plus">
              <Table.HeaderCell className="px-3">Item</Table.HeaderCell>
              <Table.HeaderCell className="px-2"></Table.HeaderCell>
              <Table.HeaderCell className="text-center px-2">
                Quantity
              </Table.HeaderCell>
              <Table.HeaderCell className="text-right px-3">
                Total
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {sortedItems
              ? sortedItems.map((item) => (
                  <Item
                    key={item.id}
                    item={item}
                    currencyCode={cart?.currency_code ?? ""}
                    layout="desktop"
                  />
                ))
              : repeat(5).map((i) => <SkeletonLineItem key={i} />)}
          </Table.Body>
        </Table>
      </div>
    </div>
  )
}

export default ItemsTemplate
