declare global {
  interface Window {
    fbq?: (...args: any[]) => void
  }
}

function fbq(...args: any[]) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq(...args)
  }
}

export function trackMetaPageView() {
  fbq("track", "PageView")
}

export function trackMetaViewContent(product: {
  id: string
  title?: string
  handle?: string
  variant?: {
    id: string
    calculated_price?: {
      calculated_amount?: number
      currency_code?: string
    }
  }
}) {
  const price = product.variant?.calculated_price
  fbq("track", "ViewContent", {
    content_ids: [product.id],
    content_name: product.title,
    content_type: "product",
    ...(price?.calculated_amount && {
      value: price.calculated_amount / 100,
      currency: price.currency_code?.toUpperCase() || "USD",
    }),
  })
}

export function trackMetaAddToCart(
  product: { id: string; title?: string },
  variantId: string,
  quantity: number,
  price?: number,
  currencyCode?: string
) {
  fbq("track", "AddToCart", {
    content_ids: [variantId],
    content_name: product.title,
    content_type: "product",
    num_items: quantity,
    ...(price && {
      value: price / 100,
      currency: currencyCode?.toUpperCase() || "USD",
    }),
  })
}

export function trackMetaInitiateCheckout(cart: {
  id: string
  items?: any[]
  total?: number
  currency_code?: string
}) {
  fbq("track", "InitiateCheckout", {
    content_ids: cart.items?.map((item: any) => item.variant_id) || [],
    content_type: "product",
    num_items: cart.items?.length || 0,
    value: cart.total ? cart.total / 100 : 0,
    currency: cart.currency_code?.toUpperCase() || "USD",
  })
}

export function trackMetaPurchase(order: {
  id: string
  total?: number
  currency_code?: string
  items?: any[]
}) {
  fbq("track", "Purchase", {
    content_ids: order.items?.map((item: any) => item.variant_id || item.id) || [],
    content_type: "product",
    num_items: order.items?.length || 0,
    value: order.total ? order.total / 100 : 0,
    currency: order.currency_code?.toUpperCase() || "USD",
  })
}

export function trackMetaSearch(query: string) {
  fbq("track", "Search", {
    search_string: query,
  })
}
