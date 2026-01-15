import Wrapper from "@modules/layout/components/wrapper"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sustainability | RuggyLand",
  description: "Sustainability",
}

export default function Sustainability() {
  return (
    <Wrapper>
      <div className=" mx-auto px-4 py-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl text-center font-bold mb-6">Sustainability</h1>
        <p className="text-base mt-4 mb-8">
          At RuggyLand, we take sustainability seriously. As a custom handmade
          rugs making brand, we understand the importance of preserving the
          environment for future generations. That's why we have made it our
          mission to promote sustainable practices in everything we do.
        </p>
        <p className="text-base mt-4 mb-8">
          From the materials we use to the packaging we send our rugs in, we
          strive to minimize our environmental footprint. We carefully select
          eco-friendly materials, such as recycled cotton, jute and wool, to
          create our rugs. We also use non-toxic dyes and chemicals, and we work
          with suppliers who share our commitment to sustainability.
        </p>
        <p className="text-base mt-4 mb-8">
          But we don't stop there. We believe that we have a social
          responsibility to give back to our communities, and that's why we
          donate a portion of our profits to charitable organizations that
          promote sustainable living and make a positive impact on people's
          lives.
        </p>
        <p className="text-base mt-4 mb-8">
          At RuggyLand, we believe that small changes can make a big difference.
          That's why we are continuously looking for ways to improve our
          sustainability efforts. We are committed to staying up-to-date with
          the latest eco-friendly innovations and technologies, and we are
          always exploring new ways to reduce our carbon footprint.
        </p>
        <p className="text-base mt-4 mb-8">
          When you choose RuggyLand, you can rest assured that you are not only
          getting a high-quality, custom handmade rug, but you are also making a
          positive impact on the environment and supporting our commitment to
          sustainability. Join us in our mission to create a more sustainable
          future, one rug at a time.
        </p>
      </div>
    </Wrapper>
  )
}
