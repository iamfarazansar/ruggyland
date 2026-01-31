import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import SignInPrompt from "../components/sign-in-prompt"
import Divider from "@modules/common/components/divider"
import { HttpTypes } from "@medusajs/types"

const CartTemplate = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  return (
    <div className="py-6 small:py-10 bg-ui-bg-base">
      <div className="content-container" data-testid="cart-container">
        {cart?.items?.length ? (
          <div className="grid grid-cols-1 gap-6 small:gap-10 lg:grid-cols-12">
            {/* LEFT: Cart items card */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-ui-border-base bg-white shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
                <div className="border-b border-ui-border-base p-4 small:p-6">
                  <h1 className="text-2xl font-semibold text-ui-fg-base">
                    Cart
                  </h1>
                  <p className="mt-1 text-sm text-ui-fg-subtle">
                    Review your items before checkout.
                  </p>
                </div>

                <div className="p-4 small:p-6">
                  {!customer && (
                    <>
                      <SignInPrompt />
                      <Divider className="my-6" />
                    </>
                  )}

                  <ItemsTemplate cart={cart} />
                </div>
              </div>
            </div>

            {/* RIGHT: Summary (sticky) */}
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-24">
                {cart && cart.region && (
                  <div className="rounded-2xl border border-ui-border-base bg-white shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
                    <div className="border-b border-ui-border-base p-4 small:p-6">
                      <h2 className="text-2xl font-semibold text-ui-fg-base">
                        Summary
                      </h2>
                    </div>

                    <div className="p-4 small:p-6">
                      <Summary cart={cart as any} />
                    </div>

                    {/* Optional: small helper note like premium PDP style */}
                    <div className="border-t border-ui-border-base p-4 small:p-6">
                      <div className="rounded-xl border border-ui-border-base bg-ui-bg-subtle px-4 py-3">
                        <p className="text-sm text-ui-fg-subtle">
                          Taxes & shipping are calculated at checkout.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <EmptyCartMessage />
          </div>
        )}
      </div>
    </div>
  )
}

export default CartTemplate
