import React, { Suspense } from "react"
import Image from "next/image"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductInfo from "@modules/products/templates/product-info"
import ProductActions from "@modules/products/components/product-actions"
import RelatedProducts from "@modules/products/components/related-products"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"

import ProductActionsWrapper from "./product-actions-wrapper"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  images,
}) => {
  if (!product || !product.id) return notFound()

  return (
    <>
      {/* TOP GRID */}
      <div className="content-container py-6" data-testid="product-container">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* LEFT: Gallery */}
          <div className="lg:col-span-7">
            <ImageGallery images={images} />
          </div>

          {/* RIGHT: Title + Price/CTA card (sticky like screenshot) */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24 flex flex-col gap-6">
              {/* Title + subtitle (keep your existing component) */}
              <ProductInfo product={product} />

              {/* PRICE + CTA CARD */}
              <div className="rounded-2xl border border-ui-border-base bg-white shadow-sm">
                <div className="p-6">
                  {/* ProductActionsWrapper usually renders price + options + add-to-cart.
                      We keep it here so it looks like the big right card. */}
                  <Suspense
                    fallback={
                      <ProductActions
                        disabled={true}
                        product={product}
                        region={region}
                      />
                    }
                  >
                    <ProductActionsWrapper id={product.id} region={region} />
                  </Suspense>

                  {/* Trust rows under CTA (like screenshot) */}
                  <div className="mt-5 rounded-xl border border-ui-border-base bg-ui-bg-subtle p-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Image
                          src="/product/Shipsin.svg"
                          alt="Shipping"
                          width={80}
                          height={80}
                        />
                        <p className="text-sm text-ui-fg-base text-center">
                          Ships in 7–10 days
                        </p>
                      </div>

                      <div className="flex flex-col items-center justify-center gap-2">
                        <Image
                          src="/product/handmade.svg"
                          alt="Handmade"
                          width={80}
                          height={80}
                        />
                        <p className="text-sm text-ui-fg-base text-center">
                          Handmade by artisans
                        </p>
                      </div>

                      <div className="flex flex-col items-center justify-center gap-2">
                        <Image
                          src="/product/Premium.svg"
                          alt="Premium"
                          width={80}
                          height={80}
                        />
                        <p className="text-sm text-ui-fg-base text-center">
                          Premium quality
                        </p>
                      </div>

                      <div className="flex flex-col items-center justify-center gap-2">
                        <Image
                          src="/product/Crafted.svg"
                          alt="Secure"
                          width={80}
                          height={80}
                        />
                        <p className="text-sm text-ui-fg-base text-center">
                          Crafted with You
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM CARDS (same row on desktop) */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-ui-border-base bg-white shadow-sm">
              <div className="border-b border-ui-border-base px-6 py-4">
                <h3 className="text-lg font-semibold text-ui-fg-base">
                  Product Information
                </h3>
              </div>

              <div className="p-6 text-sm">
                <div className="grid grid-cols-1 gap-5">
                  <div className="flex items-start justify-between gap-6">
                    <span className="font-semibold text-ui-fg-base">
                      Material
                    </span>
                    <span className="text-ui-fg-subtle text-right">
                      {product.material || "-"}
                    </span>
                  </div>
                  <div className="h-px w-full bg-ui-border-base" />
                  <div className="flex items-start justify-between gap-6">
                    <span className="font-semibold text-ui-fg-base">
                      Country of origin
                    </span>
                    <span className="text-ui-fg-subtle text-right">
                      {product.origin_country || "-"}
                    </span>
                  </div>
                  <div className="h-px w-full bg-ui-border-base" />
                  <div className="flex items-start justify-between gap-6">
                    <span className="font-semibold text-ui-fg-base">Type</span>
                    <span className="text-ui-fg-subtle text-right">
                      {product.type?.value || "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-ui-border-base bg-white shadow-sm">
              <div className="border-b border-ui-border-base px-6 py-4">
                <h3 className="text-lg font-semibold text-ui-fg-base">
                  Shipping & Returns
                </h3>
              </div>

              <div className="p-6 text-sm space-y-6">
                <div className="flex items-start gap-3">
                  <span className="text-lg">⚡</span>
                  <div>
                    <p className="font-semibold text-ui-fg-base">
                      Fast delivery
                    </p>
                    <p className="mt-1 text-ui-fg-subtle">
                      Your rug is handmade and ships in 7–10 days. Worldwide
                      delivery available.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-lg">🔁</span>
                  <div>
                    <p className="font-semibold text-ui-fg-base">
                      Simple updates
                    </p>
                    <p className="mt-1 text-ui-fg-subtle">
                      We’ll keep you updated with tracking once dispatched.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-lg">↩️</span>
                  <div>
                    <p className="font-semibold text-ui-fg-base">
                      Returns & support
                    </p>
                    <p className="mt-1 text-ui-fg-subtle">
                      Need help? Contact us and we’ll sort it out quickly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* /BOTTOM CARDS */}
        </div>
      </div>

      {/* RELATED */}
      <div
        className="content-container my-16 small:my-28"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate
