import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import DiscoverRugs from "@modules/home/components/discover-rugs"
import { listCategories } from "@lib/data/categories"
import WhyChooseRuggyLand from "@modules/home/components/why-choose"
import CustomRugBanner from "@modules/home/components/custom-rug-banner"

export const metadata: Metadata = {
  title: "RuggyLand | Premium Handmade Rugs Made to Order",
  description:
    "Premium handcrafted rugs made to order. Custom designs, clean carving, and export-quality finishing—delivered worldwide by RuggyLand.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const region = await getRegion(countryCode)

  const { collections } = await listCollections({
    fields: "id, handle, title",
  })

  if (!collections || !region) {
    return null
  }

  const productCategories = await listCategories()

  return (
    <>
      <Hero />
      <DiscoverRugs categories={productCategories} />
      <CustomRugBanner />
      <WhyChooseRuggyLand />
      {/* <LearnAboutProcess /> */}
      <div className="py-12">
        <ul className="flex flex-col gap-x-6">
          <FeaturedProducts collections={collections} region={region} />
        </ul>
      </div>
    </>
  )
}
