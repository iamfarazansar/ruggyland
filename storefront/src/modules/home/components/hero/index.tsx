"use client"

import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { BiArrowBack } from "react-icons/bi"
import Image from "next/image"
import Link from "next/link"
import { useCallback } from "react"

const Hero = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4000, stopOnInteraction: false }),
  ])

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const slides = [
    { src: "/slide-1.png", alt: "Slide 1" },
    { src: "/slide-2.png", alt: "Slide 2" },
    {
      src: "/slide-4-desktop.jpg",
      mobileSrc: "/slide-4-mobile.jpg",
      alt: "Slide 4"
    },
  ]

  return (
    <div className="relative text-white text-[20px] w-full max-w-6xl mx-auto">
      <div className="embla-hero" ref={emblaRef}>
        <div className="embla-hero__container">
          {slides.map((slide, index) => (
            <div className="embla-hero__slide" key={index}>
              <div className="relative aspect-[16/10] md:aspect-[21/9] w-full">
                {/* Desktop image */}
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  className="object-cover hidden md:block"
                  sizes="1152px"
                  priority={index === 0}
                />
                {/* Mobile image */}
                <Image
                  src={slide.mobileSrc || slide.src}
                  alt={slide.alt}
                  fill
                  className="object-cover md:hidden"
                  sizes="100vw"
                  priority={index === 0}
                />
              </div>
              <Link href="/store">
                <div className="px-[15px] md:px-[40px] py-[10px] md:py-[25px] font-oswald bg-white absolute bottom-[25px] md:bottom-[75px] left-0 text-black/[0.9] text-[15px] md:text-[30px] uppercase font-medium cursor-pointer hover:opacity-90">
                  Shop now
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      <div
        onClick={scrollPrev}
        className="absolute right-[31px] md:right-[51px] bottom-0 w-[30px] md:w-[50px] h-[30px] md:h-[50px] bg-black z-10 flex items-center justify-center cursor-pointer hover:opacity-90"
      >
        <BiArrowBack className="text-sm md:text-lg" />
      </div>
      <div
        onClick={scrollNext}
        className="absolute right-0 bottom-0 w-[30px] md:w-[50px] h-[30px] md:h-[50px] bg-black z-10 flex items-center justify-center cursor-pointer hover:opacity-90"
      >
        <BiArrowBack className="rotate-180 text-sm md:text-lg" />
      </div>
    </div>
  )
}

export default Hero
