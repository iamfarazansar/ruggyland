import Wrapper from "@modules/layout/components/wrapper"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Shipping & Return Policy | RuggyLand",
  description: "Shipping & Return Policy",
}

export default function ShippingPolicy() {
  return (
    <Wrapper>
      <div className=" mt-10">
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h1 className="text-3xl text-center font-bold mb-6">
            Shipping Policy
          </h1>
          <p className="text-lg mb-6 m-4">
            All the rugs listed on this website all made on order and
            fulfillment time is 3-5 weeks from the date of order placed. In few
            cases if delivery time exceeds the given time please feel free to
            reach us via email or Instagram DM (RUGGYLAND) for updates on the
            status of your order.
          </p>
          <p className="text-lg mb-6 m-4">Turn Around Time: 3-4 WEEKS</p>
          <p className="text-lg mb-6 m-4">
            International Turn Around Time: 3-5 WEEKS
          </p>

          <h2 className="text-[20px] mt-[20px] mb-[10px] m-4">
            Order Tracking
          </h2>
          <p className="text-lg mb-6 m-4">
            Once your order has been shipped, you will receive an email with
            tracking information. You can also log in to your account on our
            website to view the status of your order and tracking information.
          </p>
          <h2 className="text-[20px] mt-[20px] mb-6 m-4">Shipping Address</h2>
          <p className="text-lg mb-6 m-4">
            Please ensure that the shipping address you provide during checkout
            is accurate and complete. We are not responsible for packages that
            are undeliverable due to an incorrect or incomplete address.
          </p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h1 className="text-3xl text-center font-bold mb-6">Return Policy</h1>
          <p className="text-lg mb-6 m-4">
            We have specialized quality control measures to ensure that the
            product(s) you receive are of the highest quality. In the rare case
            that you receive a damaged/ defective product please reach out to
            us.
          </p>
          <p className="text-lg  m-4">Please check for the following:</p>
          <p className="text-lg  m-4">
            – Stains on the product(s)<br></br>– Stitching inconsistency
            <br></br>– More than a 3% variation in size
          </p>
          <p className="text-lg mb-6 m-4">
            Depending on the nature of the defect, we will either replace the
            product or refund the purchase amount. Please contact us within 7
            days of receiving the product.
          </p>
          <p className="text-lg mb-6 m-4">
            Please email us (company email). We will attend to your query within
            two business days.
          </p>
          <p className="text-lg mb-6 m-4">
            Please ensure that all tags and labels are intact and the product is
            unused. Please email us photographs of the defect along with the
            order number and item code.
          </p>
          <p className="text-lg mb-6 m-4">
            Return/Refund is only applicable if the delivered product is damaged
            caused by logistics company, please do make an unpacking video of
            the rug when you receive it.
          </p>
        </div>
      </div>
    </Wrapper>
  )
}
