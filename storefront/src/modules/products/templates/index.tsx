import React, { Suspense } from "react"
import Image from "next/image"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductViewTracker from "@modules/products/components/product-view-tracker"
import ProductInfo from "@modules/products/templates/product-info"
import ProductActions from "@modules/products/components/product-actions"
import RelatedProducts from "@modules/products/components/related-products"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import MobileBackButton from "@modules/common/components/mobile-back-button"

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
      <ProductViewTracker product={product} />
      {/* TOP GRID */}
      <div className="content-container py-6" data-testid="product-container">
        {/* Mobile Back Button */}
        <MobileBackButton />

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
                    {/* @ts-expect-error Async Server Component */}
                    <ProductActionsWrapper id={product.id} region={region} />
                  </Suspense>

                  {/* Trust rows under CTA */}
                  <div className="mt-5 border-t border-ui-border-base pt-5">
                    <div className="flex flex-wrap justify-between gap-y-4">
                      <div className="flex flex-col items-center justify-center gap-2 w-1/2 lg:w-auto lg:flex-1">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#fbf8f2]">
                          <Image
                            src="/product/Shipsin.svg"
                            alt="Shipping"
                            width={32}
                            height={32}
                          />
                        </div>
                        <p className="text-xs text-[#574b45] text-center leading-tight font-medium">
                          Ships in 7–10 days
                        </p>
                      </div>

                      <div className="flex flex-col items-center justify-center gap-2 w-1/2 lg:w-auto lg:flex-1">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#fbf8f2]">
                          <Image
                            src="/product/handmade.svg"
                            alt="Handmade"
                            width={32}
                            height={32}
                          />
                        </div>
                        <p className="text-xs text-[#574b45] text-center leading-tight font-medium">
                          Handmade with love
                        </p>
                      </div>

                      <div className="flex flex-col items-center justify-center gap-2 w-1/2 lg:w-auto lg:flex-1">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#fbf8f2]">
                          <Image
                            src="/product/Premium.svg"
                            alt="Premium"
                            width={32}
                            height={32}
                          />
                        </div>
                        <p className="text-xs text-[#574b45] text-center leading-tight font-medium">
                          Premium quality
                        </p>
                      </div>

                      <div className="flex flex-col items-center justify-center gap-2 w-1/2 lg:w-auto lg:flex-1">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#fbf8f2]">
                          <Image
                            src="/product/Crafted.svg"
                            alt="Secure"
                            width={32}
                            height={32}
                          />
                        </div>
                        <p className="text-xs text-[#574b45] text-center leading-tight font-medium">
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
          <div className="lg:col-span-7 flex flex-col gap-6">
            {product.description && (
              <div className="rounded-2xl border border-ui-border-base bg-white shadow-sm">
                <div className="border-b border-ui-border-base px-6 py-4">
                  <h3 className="text-lg font-semibold text-ui-fg-base">
                    Description
                  </h3>
                </div>
                <div
                  className="p-6 space-y-4 text-sm text-ui-fg-subtle leading-relaxed"
                  data-testid="product-description"
                >
                  {product.description?.split(/\n\n+/).map((block, i) => {
                    const isBlockquote = block.startsWith("> ")
                    const text = isBlockquote ? block.slice(2) : block

                    const renderInline = (str: string) => {
                      const parts: React.ReactNode[] = []
                      const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g
                      let lastIndex = 0
                      let match

                      while ((match = regex.exec(str)) !== null) {
                        if (match.index > lastIndex) {
                          parts.push(str.slice(lastIndex, match.index))
                        }
                        if (match[2]) {
                          parts.push(<strong key={match.index} className="font-semibold text-ui-fg-base">{match[2]}</strong>)
                        } else if (match[3]) {
                          parts.push(<em key={match.index}>{match[3]}</em>)
                        }
                        lastIndex = regex.lastIndex
                      }
                      if (lastIndex < str.length) {
                        parts.push(str.slice(lastIndex))
                      }
                      return parts
                    }

                    if (isBlockquote) {
                      return (
                        <blockquote key={i} className="border-l-2 border-ui-border-base pl-4 italic text-ui-fg-muted">
                          {renderInline(text)}
                        </blockquote>
                      )
                    }

                    return <p key={i}>{renderInline(text)}</p>
                  })}
                </div>
              </div>
            )}

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
                      {product.origin_country
                        ? new Intl.DisplayNames(["en"], { type: "region" }).of(product.origin_country.toUpperCase()) || product.origin_country
                        : "-"}
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
                  <Image
                    src="/product/truck.svg"
                    alt="Shipping"
                    width={32}
                    height={32}
                    className="flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="font-semibold text-ui-fg-base">
                      Ships in 7–10 days
                    </p>
                    <p className="mt-1 text-ui-fg-subtle">
                      Your rug is handmade and ships in 7–10 days. Worldwide
                      delivery available.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Image
                    src="/product/update.svg"
                    alt="Updates"
                    width={32}
                    height={32}
                    className="flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="font-semibold text-ui-fg-base">
                      Manufacturing updates
                    </p>
                    <p className="mt-1 text-ui-fg-subtle">
                      We’ll keep you updated throughout the rug-making process.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Image
                    src="/product/help.svg"
                    alt="Support"
                    width={32}
                    height={32}
                    className="flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="font-semibold text-ui-fg-base">
                      Support & help
                    </p>
                    <p className="mt-1 text-ui-fg-subtle">
                      Need assistance? Contact us and we’ll sort it out quickly.
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
          {/* @ts-expect-error Async Server Component */}
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate
