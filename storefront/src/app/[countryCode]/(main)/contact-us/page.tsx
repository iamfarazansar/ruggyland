import Wrapper from "@modules/layout/components/wrapper"
import Link from "next/link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Us | RuggyLand",
  description: "Contact RuggyLand",
}

export default function ContactUs() {
  return (
    <Wrapper>
      <div className="mx-auto p-6 bg-white rounded-lg shadow-xl">
        <h1 className="text-4xl font-bold text-center mb-6">Contact Us</h1>
        <p className="text-lg text-center mb-4">
          Thank you for your interest in RuggyLand. We would love to hear from
          you.
        </p>
        <p className="text-lg mb-4">
          If you have any queries or would like to know more about our products
          and services, please do not hesitate to contact us.
        </p>
        <p className="text-lg mb-4">
          You can reach us through the following channels:
        </p>
        <p className="text-lg mb-4">
          Email: <a href="mailto:ruggyland@gmail.com">ruggyland@gmail.com</a>
        </p>
        <p className="text-lg mb-4">
          Address: RuggyLand, Bhadohi, Uttar Pradesh, India
        </p>
        <p className="text-lg mb-6">
          You can also fill out the contact form on our website, and we will get
          back to you as soon as possible.
        </p>
        <Link
          href="https://docs.google.com/forms/d/e/1FAIpQLSfdGbt4pu9BeBfKMLaVp0BslEXHzBPMQfdPvopZp2vJGa6lTw/viewform?usp=sf_link"
          target="_blank"
        >
          <div className="text-center pt-8">
            <button className="px-6 py-2 bg-gray-700 text-white rounded-lg focus:outline-none">
              Click Here to Open Form
            </button>
          </div>
        </Link>

        <p className="text-lg mt-6 text-center">
          Thank you for choosing RuggyLand. We look forward to hearing from you.
        </p>
      </div>
    </Wrapper>
  )
}
