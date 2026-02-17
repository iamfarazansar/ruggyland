import posthog from "posthog-js"

export function trackProductViewed(product: {
  id: string
  title?: string
  handle?: string
  thumbnail?: string | null
}) {
  posthog.capture("Product Viewed", {
    product_id: product.id,
    product_name: product.title,
    product_handle: product.handle,
  })
}

export function trackAddToCart(
  product: { id: string; title?: string },
  variantId: string,
  quantity: number
) {
  posthog.capture("Add to Cart", {
    product_id: product.id,
    product_name: product.title,
    variant_id: variantId,
    quantity,
  })
}

export function trackLogin(method: "email" | "google") {
  posthog.capture("Customer Login", { method })
}

export function trackSignup() {
  posthog.capture("Customer Signup")
}

export function trackOrderCompleted(order: {
  id: string
  total?: number
  currency_code?: string
  items?: any[]
}) {
  posthog.capture("Order Completed", {
    order_id: order.id,
    total: order.total,
    currency: order.currency_code,
    item_count: order.items?.length ?? 0,
  })
}
