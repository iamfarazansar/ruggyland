"use client"
import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import "react-responsive-carousel/lib/styles/carousel.min.css" // requires a loader
import { Carousel } from "react-responsive-carousel"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const items = images.slice(0, 10)

  return (
    <div className="text-white text-[20px] w-full max-w-[1360px] mx-auto sticky top-[50px]">
      <Carousel
        infiniteLoop={true}
        showIndicators={false}
        showStatus={false}
        thumbWidth={60}
        className="productCarousel"
      >
        {images.map((img) => (
          <img key={img.id} src={img.url} alt="Thumbnail" />
        ))}
        {/* <img src="/p1.webp" />
            <img src="/p2.webp" />
            <img src="/p3.webp" />
            <img src="/p4.webp" /> */}
      </Carousel>
    </div>
  )
}

export default ImageGallery
