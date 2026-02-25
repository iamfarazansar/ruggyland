import Wrapper from "@modules/layout/components/wrapper"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | RuggyLand",
  description:
    "Privacy Policy for RuggyLand — how we collect and use your data",
}

export default function PrivacyPolicy() {
  return (
    <Wrapper>
      <div className="mt-10 mb-16">
        <div className="bg-white rounded-lg p-6 md:p-10 shadow-lg max-w-4xl mx-auto">
          <h1 className="text-3xl text-center font-bold mb-2">
            Privacy Policy
          </h1>
          <p className="text-center text-sm text-ui-fg-muted mb-8">
            Last updated: February 2026
          </p>

          {/* Intro */}
          <section className="mb-8">
            <p className="text-base leading-relaxed text-ui-fg-subtle">
              RuggyLand (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;)
              operates ruggyland.com. This Privacy Policy explains what
              information we collect, how we use it, and your rights regarding
              that information. By using our website, you agree to the practices
              described below.
            </p>
          </section>

          {/* 1. Information We Collect */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">
              1. Information We Collect
            </h2>

            <h3 className="text-base font-semibold mb-1">
              a) Information You Provide
            </h3>
            <p className="text-sm text-ui-fg-subtle leading-relaxed mb-3">
              When you place an order, create an account, or contact us, we
              collect your name, email, shipping address, phone number, and
              payment details. Payment information is processed securely by our
              third-party payment providers and is never stored on our servers.
            </p>

            <h3 className="text-base font-semibold mb-1">
              b) Automatic Information
            </h3>
            <p className="text-sm text-ui-fg-subtle leading-relaxed">
              We automatically collect certain data when you visit our site,
              including your IP address, browser type, device information, pages
              visited, and referring URL. This data is collected through cookies
              and similar technologies (see Section 3 below).
            </p>
          </section>

          {/* 2. How We Use Your Information */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">
              2. How We Use Your Information
            </h2>
            <ul className="list-disc list-inside text-sm text-ui-fg-subtle leading-relaxed space-y-1">
              <li>To process and fulfill your orders</li>
              <li>To communicate with you about your orders and account</li>
              <li>To improve our website and services (analytics)</li>
              <li>
                To deliver relevant advertisements and measure their
                effectiveness (marketing)
              </li>
              <li>To prevent fraud and ensure site security</li>
            </ul>
          </section>

          {/* 3. Cookies & Tracking */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">
              3. Cookies & Tracking Technologies
            </h2>
            <p className="text-sm text-ui-fg-subtle leading-relaxed mb-4">
              We use cookies and similar technologies on our site. You can
              manage your preferences at any time via the cookie consent banner
              or the &quot;Cookie Settings&quot; link in our footer. We
              categorise cookies as follows:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-4 py-2 font-semibold">
                      Category
                    </th>
                    <th className="text-left px-4 py-2 font-semibold">
                      Purpose
                    </th>
                    <th className="text-left px-4 py-2 font-semibold">
                      Provider
                    </th>
                    <th className="text-left px-4 py-2 font-semibold">
                      Can You Opt Out?
                    </th>
                  </tr>
                </thead>
                <tbody className="text-ui-fg-subtle">
                  <tr className="border-t border-gray-200">
                    <td className="px-4 py-2 font-medium">Essential</td>
                    <td className="px-4 py-2">
                      Cart, checkout, login, region/currency preferences
                    </td>
                    <td className="px-4 py-2">RuggyLand (Medusa)</td>
                    <td className="px-4 py-2">
                      No — required for the site to function
                    </td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td className="px-4 py-2 font-medium">Analytics</td>
                    <td className="px-4 py-2">
                      Page views, clicks, session recordings, feature usage.
                      Helps us understand how visitors use the site so we can
                      improve it.
                    </td>
                    <td className="px-4 py-2">
                      PostHog (
                      <a
                        href="https://posthog.com/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        privacy policy
                      </a>
                      )
                    </td>
                    <td className="px-4 py-2">
                      Yes — via cookie consent banner
                    </td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td className="px-4 py-2 font-medium">Marketing</td>
                    <td className="px-4 py-2">
                      Conversion tracking, ad performance measurement, and
                      retargeting. Tracks events such as ViewContent, AddToCart,
                      and Purchase.
                    </td>
                    <td className="px-4 py-2">
                      Meta Pixel / Facebook (
                      <a
                        href="https://www.facebook.com/privacy/policy/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        privacy policy
                      </a>
                      )
                    </td>
                    <td className="px-4 py-2">
                      Yes — via cookie consent banner
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 4. Data Sharing */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">4. Data Sharing</h2>
            <p className="text-sm text-ui-fg-subtle leading-relaxed">
              We do not sell your personal information. We share data only with
              third-party service providers who help us operate our business
              (e.g. payment processors, shipping partners, analytics and
              advertising platforms listed above). These providers are
              contractually obligated to protect your data.
            </p>
          </section>

          {/* 5. Data Retention */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">5. Data Retention</h2>
            <p className="text-sm text-ui-fg-subtle leading-relaxed">
              We retain your personal data for as long as necessary to fulfill
              the purposes described in this policy, comply with legal
              obligations, and resolve disputes. Order data is retained for a
              minimum of 5 years for accounting and tax purposes.
            </p>
          </section>

          {/* 6. Your Rights */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">6. Your Rights</h2>
            <p className="text-sm text-ui-fg-subtle leading-relaxed mb-2">
              Depending on your location, you may have the right to:
            </p>
            <ul className="list-disc list-inside text-sm text-ui-fg-subtle leading-relaxed space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent for analytics and marketing cookies</li>
              <li>Object to or restrict certain processing</li>
              <li>Data portability</li>
            </ul>
            <p className="text-sm text-ui-fg-subtle leading-relaxed mt-2">
              To exercise any of these rights, please contact us at{" "}
              <a
                href="mailto:info@ruggyland.com"
                className="underline font-medium"
              >
                info@ruggyland.com
              </a>
              .
            </p>
          </section>

          {/* 7. Security */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">7. Security</h2>
            <p className="text-sm text-ui-fg-subtle leading-relaxed">
              We implement appropriate technical and organisational measures to
              protect your personal data against unauthorised access, loss, or
              misuse. All data transmitted between your browser and our servers
              is encrypted via HTTPS/TLS.
            </p>
          </section>

          {/* 8. Changes */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">
              8. Changes to This Policy
            </h2>
            <p className="text-sm text-ui-fg-subtle leading-relaxed">
              We may update this Privacy Policy from time to time. Any changes
              will be posted on this page with an updated &quot;Last
              updated&quot; date. We encourage you to review this page
              periodically.
            </p>
          </section>

          {/* 9. Contact */}
          <section>
            <h2 className="text-xl font-semibold mb-3">9. Contact Us</h2>
            <p className="text-sm text-ui-fg-subtle leading-relaxed">
              If you have any questions about this Privacy Policy or your data,
              please contact us at:{" "}
              <a
                href="mailto:info@ruggyland.com"
                className="underline font-medium"
              >
                info@ruggyland.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </Wrapper>
  )
}
