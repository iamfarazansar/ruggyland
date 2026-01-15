import Wrapper from "@modules/layout/components/wrapper"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | RuggyLand",
  description: "Each rug is handcrafted with love and attention to details",
}

export default function PrivacyPolicy() {
  return (
    <Wrapper>
      <div className=" mt-10">
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h1 className="text-3xl text-center font-bold mb-6">
            Privacy Policy
          </h1>

          <p className="text-lg mb-6 m-4">
            Information is collected on this site by ruggyland.com (RuggyLand)
            will take all measures to protect your personal information. Any
            personal information received will only be used to fill your order.
            We will not sell or redistribute your information to anyone. Any
            information you provide will be governed by this privacy policy and
            our terms and conditions. We may collect two types of information
            via this website: information you specifically provide to us, and
            automatic information associated with your use of this site.
            Information you specifically provide to us includes any information
            you enter into a form or send to us via e-mail. Examples of this
            information include information you enter when placing an order or
            setting up an account. Automatic information associated with your
            use of this site includes any information arising from your use of
            this site which you do not specifically provide. Examples of this
            information include your IP address, the type of web browser you are
            using, and the speed of your web connection. We will protect your
            data and not sell it any cost please feel free to contact
            ruggyland@gmail.com.
          </p>
        </div>
      </div>
    </Wrapper>
  )
}
