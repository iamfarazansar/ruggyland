import { Metadata } from "next"
import Wrapper from "@modules/layout/components/wrapper"

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy",
  description: "Each rug is handcrafted with love and attention to details",
}

export default function CancellationRefundPolicy() {
  return (
    <Wrapper>
      <div className="mx-auto p-6 bg-white rounded-lg shadow-xl">
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h1 className="text-3xl text-center font-bold mb-8">
            Cancellation Policy
          </h1>

          <p className="text-lg mb-4">
            We understand if you wish to change or cancel your order. You can
            cancel your order within 48 hours.
          </p>

          <p className="text-lg font-bold mb-4">How to cancel the order?</p>

          <p className="text-lg mb-4">
            Email us from the same email id provided during checkout, mention
            your order number. We will get in touch with you to cancel your
            order and refund your amount immediately.
          </p>

          <p className="text-lg mb-4">
            Email at:{" "}
            <a href="mailto:ruggyland@gmail.com">ruggyland@gmail.com</a>
          </p>
        </div>

        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h1 className="text-3xl text-center font-bold mb-8">Refund Policy</h1>

          <p className="text-lg mb-4">
            RuggyLand have specialized quality control measures in place to
            ensure that the product(s) you receive are of the highest quality.
            In the rare case that you receive a damaged/ defective product
            please reach out to us under the following circumstances:
          </p>

          <ul className="list-disc mb-8">
            <li className="text-lg mb-2">Stains on the product(s)</li>
            <li className="text-lg mb-2">Stitching inconsistencies</li>
            <li className="text-lg mb-2">More than a 3% variation in size</li>
            <li className="text-lg mb-2">
              Depending on the nature of the defect, we will either replace the
              product or refund the purchase amount.
            </li>
            <li className="text-lg mb-2">
              Please contact us within 7 days of receiving the product.
            </li>
            <li className="text-lg mb-2">
              Please email us at{" "}
              <a href="mailto:ruggyland@gmail.com">ruggyland@gmail.com</a> and
              include photographs of the defect along with the order number and
              item code. We will attend to your query as soon as we can.
            </li>
            <li className="text-lg mb-2">
              Please ensure that all tags and labels are intact and the product
              is unused.
            </li>
            <li className="text-lg mb-2">
              Once refund is approved by us, it'll get processed within 7-10
              business days.
            </li>
          </ul>
        </div>
      </div>
    </Wrapper>
  )
}
