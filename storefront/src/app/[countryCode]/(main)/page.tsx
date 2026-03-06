import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import DiscoverRugs from "@modules/home/components/discover-rugs"
import { listCategories } from "@lib/data/categories"
import WhyChooseRuggyLand from "@modules/home/components/why-choose"
import CustomRugBanner from "@modules/home/components/custom-rug-banner"
import StoriesTufted from "@modules/home/components/stories-tufted"
import FAQ from "@modules/common/components/faq"
import { listRugStories } from "@lib/data/rug-stories"
import { getAlternates } from "@lib/seo/hreflang"
import OrganizationSchema from "@components/seo/OrganizationSchema"
import FAQSchema from "@components/seo/FAQSchema"

export async function generateMetadata(props: {
  params: Promise<{ countryCode: string }>
}): Promise<Metadata> {
  const { countryCode } = await props.params
  return {
    title: "RuggyLand | Premium Handmade Rugs Made to Order",
    description:
      "Premium handcrafted rugs made to order. Custom designs, clean carving, and export-quality finishing—delivered worldwide by RuggyLand.",
    alternates: getAlternates("", countryCode),
  }
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
  const { stories } = await listRugStories()

  return (
    <>
      <OrganizationSchema />
      <FAQSchema />
      <Hero />
      <DiscoverRugs categories={productCategories} />
      <CustomRugBanner />
      <StoriesTufted stories={stories} />
      <WhyChooseRuggyLand />
      <FAQ />
      {/* <LearnAboutProcess /> */}
      <div className="py-12">
        <ul className="flex flex-col gap-x-6">
          <FeaturedProducts collections={collections} region={region} />
        </ul>
      </div>
    </>
  )
}
