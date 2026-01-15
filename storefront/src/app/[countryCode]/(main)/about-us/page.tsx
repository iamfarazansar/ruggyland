import { Metadata } from "next"
import Wrapper from "@modules/layout/components/wrapper"

export const metadata: Metadata = {
  title: "About Us",
  description: "About RuggyLand",
}

export default function AboutUs() {
  return (
    <Wrapper>
      <div className="mx-auto p-6 bg-white rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-6">About Us</h1>
        <p className="text-lg leading-relaxed">
          Welcome to RuggyLand, a premium rug manufacturer based in Bhadohi,
          Uttar Pradesh, also known as the carpet city of India. We specialize
          in producing a wide range of rugs, including hand-tufted,
          hand-knotted, Persian, Tibbati, jute rugs, and more. <br />
          <br />
          At RuggyLand, we understand the importance of quality and detailing in
          our rugs, which is why we ensure that each rug is crafted with utmost
          care and attention to detail. Our experienced artisans use only the
          finest materials and techniques to produce rugs that are not only
          beautiful but also durable and long-lasting. <br />
          <br />
          We take pride in offering customized rug solutions to our customers.
          Whether you need a rug for your home, office, or any other space, we
          can create a rug that perfectly fits your requirements. You can send
          us your own design or choose from a wide range of themes like anime,
          shows, modern, floral, abstract, and more. <br />
          <br />
          At RuggyLand, we believe in providing the best customer service
          possible. Our team of dedicated professionals is always available to
          help you with any queries or concerns you may have. We are committed
          to ensuring that our customers are completely satisfied with our
          products and services. <br />
          <br />
          Thank you for choosing RuggyLand. We look forward to serving you and
          helping you find the perfect rug for your space.
        </p>
      </div>
    </Wrapper>
  )
}
