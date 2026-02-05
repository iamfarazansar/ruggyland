"use client"
import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { useState, useEffect, useRef, useCallback } from "react"
import useEmblaCarousel from "embla-carousel-react"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([])

  const [emblaMainRef, emblaMainApi] = useEmblaCarousel({ loop: true })
  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
    axis: "y",
  })

  const onThumbClick = useCallback(
    (index: number) => {
      if (!emblaMainApi) return
      emblaMainApi.scrollTo(index)
    },
    [emblaMainApi]
  )

  const onSelect = useCallback(() => {
    if (!emblaMainApi) return
    const index = emblaMainApi.selectedScrollSnap()
    setSelectedIndex(index)
    if (emblaThumbsApi) {
      emblaThumbsApi.scrollTo(index)
    }
  }, [emblaMainApi, emblaThumbsApi])

  useEffect(() => {
    if (!emblaMainApi) return
    onSelect()
    emblaMainApi.on("select", onSelect)
    emblaMainApi.on("reInit", onSelect)
    return () => {
      emblaMainApi.off("select", onSelect)
      emblaMainApi.off("reInit", onSelect)
    }
  }, [emblaMainApi, onSelect])

  // Auto-scroll mobile thumbnail into view
  useEffect(() => {
    if (thumbRefs.current[selectedIndex]) {
      thumbRefs.current[selectedIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      })
    }
  }, [selectedIndex])

  return (
    <div className="embla-product w-full max-w-[1360px] mx-auto sticky top-[50px]">
      <div className="embla-product__wrapper">
        {/* Desktop thumbnails - vertical on left (hidden on mobile via CSS) */}
        <div className="embla-product__thumbs" ref={emblaThumbsRef}>
          <div className="embla-product__thumbs-container">
            {images.map((img, index) => (
              <button
                key={img.id}
                onClick={() => onThumbClick(index)}
                className={`embla-product__thumb ${
                  selectedIndex === index
                    ? "embla-product__thumb--selected"
                    : ""
                }`}
                type="button"
              >
                <Image
                  src={img.url}
                  alt={`Thumbnail ${index + 1}`}
                  width={60}
                  height={48}
                  className="embla-product__thumb-image"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Main carousel */}
        <div className="embla-product__main" ref={emblaMainRef}>
          <div className="embla-product__main-container">
            {images.map((img, index) => (
              <div className="embla-product__slide" key={img.id}>
                <div className="embla-product__slide-wrapper">
                  <Image
                    src={img.url}
                    alt="Product image"
                    fill
                    priority={index === 0}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="embla-product__slide-image"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile thumbnails - horizontal below (hidden on desktop via CSS) */}
      <div className="embla-product__thumbs-mobile">
        {images.map((img, index) => (
          <button
            key={img.id}
            ref={(el) => {
              thumbRefs.current[index] = el
            }}
            onClick={() => onThumbClick(index)}
            className={`embla-product__thumb-mobile ${
              selectedIndex === index
                ? "embla-product__thumb-mobile--selected"
                : ""
            }`}
            type="button"
          >
            <Image
              src={img.url}
              alt={`Thumbnail ${index + 1}`}
              width={60}
              height={48}
              className="embla-product__thumb-mobile-image"
            />
          </button>
        ))}
      </div>
    </div>
  )
}

export default ImageGallery
