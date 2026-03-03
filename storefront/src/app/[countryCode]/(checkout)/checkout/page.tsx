import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import MetaCheckoutTracker from "@lib/meta-pixel/checkout-tracker"
import MetaFbCookieSyncer from "@lib/meta-pixel/fb-cookie-syncer"
import PaymentWrapper from "@modules/checkout/components/payment-wrapper"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Checkout",
}

type Params = {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ step?: string }>
}

export default async function Checkout({ params, searchParams }: Params) {
  const { countryCode } = await params
  const { step } = await searchParams

  const cart = await retrieveCart()

  if (!cart) {
    return notFound()
  }

  // Auto-advance to the appropriate step when none is set (e.g. arriving via Buy Now)
  if (!step) {
    if (!cart.shipping_address?.address_1) {
      redirect(`/${countryCode}/checkout?step=address`)
    } else if (!cart.shipping_methods?.length) {
      redirect(`/${countryCode}/checkout?step=delivery`)
    } else {
      redirect(`/${countryCode}/checkout?step=payment`)
    }
  }

  const customer = await retrieveCustomer()

  return (
    <div className="grid grid-cols-1 small:grid-cols-[1fr_416px] content-container gap-x-40 py-12">
      <MetaCheckoutTracker cart={{ id: cart.id, items: cart.items, total: cart.total, currency_code: cart.currency_code }} />
      <MetaFbCookieSyncer />
      <PaymentWrapper cart={cart}>
        <CheckoutForm cart={cart} customer={customer} />
      </PaymentWrapper>
      <CheckoutSummary cart={cart} />
    </div>
  )
}
