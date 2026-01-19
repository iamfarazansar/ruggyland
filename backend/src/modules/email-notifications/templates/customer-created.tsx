import {
  Text,
  Section,
  Hr,
  Img,
  Button,
  Row,
  Column,
  Container,
  Link,
} from "@react-email/components";
import * as React from "react";
import { Base } from "./base";

export const CUSTOMER_CREATED = "customer-created";

interface CustomerCreatedPreviewProps {
  customer: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
}

export interface CustomerCreatedTemplateProps {
  customer: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
  preview?: string;
}

export const isCustomerCreatedTemplateData = (
  data: any,
): data is CustomerCreatedTemplateProps =>
  typeof data.customer === "object" && typeof data.customer.email === "string";

export const CustomerCreatedTemplate: React.FC<CustomerCreatedTemplateProps> & {
  PreviewProps: CustomerCreatedPreviewProps;
} = ({ customer, preview = "Welcome to RuggyLand! 🎉" }) => {
  const firstName = customer.first_name || "there";

  return (
    <Base preview={preview}>
      <table
        cellPadding="0"
        cellSpacing="0"
        style={{
          width: "100%",
          maxWidth: "600px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <tr>
          <td style={{ padding: "0" }}>
            {/* Header */}
            <table
              cellPadding="0"
              cellSpacing="0"
              style={{ width: "100%", backgroundColor: "#FAF8F5" }}
            >
              <tr>
                <td style={{ padding: "40px 24px 32px", textAlign: "center" }}>
                  <img
                    src="https://ruggyland-qa1.s3.ap-southeast-2.amazonaws.com/logo_main.png"
                    alt="RuggyLand"
                    width="100"
                    style={{ margin: "0 auto 20px", display: "block" }}
                  />

                  <h1
                    style={{
                      fontSize: "26px",
                      fontWeight: "700",
                      color: "#1a1a1a",
                      margin: "0",
                      fontFamily:
                        "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
                    }}
                  >
                    Welcome to RuggyLand! 🎉
                  </h1>
                </td>
              </tr>
            </table>

            {/* Greeting */}
            <table cellPadding="0" cellSpacing="0" style={{ width: "100%" }}>
              <tr>
                <td style={{ padding: "32px 24px 16px" }}>
                  <p
                    style={{
                      fontSize: "16px",
                      color: "#333333",
                      margin: "0",
                      lineHeight: "1.7",
                    }}
                  >
                    Hi <strong>{firstName}</strong>, thanks for joining the
                    RuggyLand family! We're thrilled to have you here.
                  </p>
                  <p
                    style={{
                      fontSize: "15px",
                      color: "#666666",
                      margin: "16px 0 0",
                      lineHeight: "1.6",
                    }}
                  >
                    Your account is all set up and ready for you to explore our
                    handcrafted rug collection. 🏠✨
                  </p>
                </td>
              </tr>
            </table>

            {/* Divider */}
            <table cellPadding="0" cellSpacing="0" style={{ width: "100%" }}>
              <tr>
                <td style={{ padding: "0 24px" }}>
                  <div style={{ borderTop: "1px solid #E5E5E5" }}></div>
                </td>
              </tr>
            </table>

            {/* Benefits Section */}
            <table cellPadding="0" cellSpacing="0" style={{ width: "100%" }}>
              <tr>
                <td style={{ padding: "24px" }}>
                  <h2
                    style={{
                      fontSize: "18px",
                      fontWeight: "700",
                      color: "#1a1a1a",
                      margin: "0 0 16px",
                    }}
                  >
                    What You Can Do Now
                  </h2>

                  {/* Benefit 1 */}
                  <div
                    style={{
                      backgroundColor: "#FAF8F5",
                      borderRadius: "12px",
                      padding: "16px",
                      marginBottom: "12px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: "700",
                        color: "#1a1a1a",
                        margin: "0 0 6px",
                      }}
                    >
                      🛍️ Shop Exclusive Rugs
                    </p>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#555555",
                        margin: "0",
                        lineHeight: "1.5",
                      }}
                    >
                      Browse our handcrafted collection of custom-made rugs,
                      shipped worldwide.
                    </p>
                  </div>

                  {/* Benefit 2 */}
                  <div
                    style={{
                      backgroundColor: "#FAF8F5",
                      borderRadius: "12px",
                      padding: "16px",
                      marginBottom: "12px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: "700",
                        color: "#1a1a1a",
                        margin: "0 0 6px",
                      }}
                    >
                      🎨 Create Your Own Rug
                    </p>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#555555",
                        margin: "0",
                        lineHeight: "1.5",
                      }}
                    >
                      Turn your idea into a handmade rug — share a photo or
                      concept and we'll bring it to life.
                    </p>
                  </div>

                  {/* Benefit 3 */}
                  <div
                    style={{
                      backgroundColor: "#FAF8F5",
                      borderRadius: "12px",
                      padding: "16px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: "700",
                        color: "#1a1a1a",
                        margin: "0 0 6px",
                      }}
                    >
                      ✨ Be Part of Our Story
                    </p>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#555555",
                        margin: "0",
                        lineHeight: "1.5",
                      }}
                    >
                      Follow our journey, see behind-the-scenes crafting, and
                      become a part of the RuggyLand community.
                    </p>
                  </div>
                </td>
              </tr>
            </table>

            {/* CTA Button */}
            <table cellPadding="0" cellSpacing="0" style={{ width: "100%" }}>
              <tr>
                <td style={{ padding: "8px 24px 32px", textAlign: "center" }}>
                  <a
                    href="https://ruggyland.com/store"
                    style={{
                      display: "inline-block",
                      backgroundColor: "#6B5B4F",
                      color: "#ffffff",
                      padding: "14px 36px",
                      borderRadius: "50px",
                      fontSize: "14px",
                      fontWeight: "600",
                      textDecoration: "none",
                    }}
                  >
                    Start Shopping →
                  </a>
                </td>
              </tr>
            </table>

            {/* Footer */}
            <table
              cellPadding="0"
              cellSpacing="0"
              style={{ width: "100%", backgroundColor: "#FAF8F5" }}
            >
              <tr>
                <td style={{ padding: "28px 24px", textAlign: "center" }}>
                  {/* Help Text */}
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#666666",
                      margin: "0 0 20px",
                      lineHeight: "1.6",
                    }}
                  >
                    Questions? Reply to this email or contact us at{" "}
                    <a
                      href="mailto:info@ruggyland.com"
                      style={{ color: "#6B5B4F", fontWeight: "600" }}
                    >
                      info@ruggyland.com
                    </a>
                    . We're always happy to help!
                  </p>

                  {/* Social Media */}
                  <table
                    cellPadding="0"
                    cellSpacing="0"
                    style={{ margin: "0 auto" }}
                  >
                    <tr>
                      <td style={{ padding: "0 10px" }}>
                        <a
                          href="https://www.instagram.com/ruggyland/"
                          style={{ textDecoration: "none" }}
                        >
                          <img
                            src="https://ruggyland-qa1.s3.ap-southeast-2.amazonaws.com/%E2%80%94Pngtree%E2%80%94instagram+icon+vector_8704817.png"
                            alt="Instagram"
                            width="24"
                            height="24"
                            style={{ display: "block" }}
                          />
                        </a>
                      </td>
                      <td style={{ padding: "0 10px" }}>
                        <a
                          href="https://www.facebook.com/ruggy.land.2025"
                          style={{ textDecoration: "none" }}
                        >
                          <img
                            src="https://ruggyland-qa1.s3.ap-southeast-2.amazonaws.com/Facebook_logo_(square).png"
                            alt="Facebook"
                            width="24"
                            height="24"
                            style={{ display: "block" }}
                          />
                        </a>
                      </td>
                      <td style={{ padding: "0 10px" }}>
                        <a
                          href="https://in.pinterest.com/ruggyland/"
                          style={{ textDecoration: "none" }}
                        >
                          <img
                            src="https://ruggyland-qa1.s3.ap-southeast-2.amazonaws.com/pinterest_13170435.png"
                            alt="Pinterest"
                            width="24"
                            height="24"
                            style={{ display: "block" }}
                          />
                        </a>
                      </td>
                    </tr>
                  </table>

                  {/* Copyright */}
                  <p
                    style={{
                      fontSize: "11px",
                      color: "#999999",
                      margin: "20px 0 0",
                    }}
                  >
                    © 2026 RuggyLand. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </Base>
  );
};

CustomerCreatedTemplate.PreviewProps = {
  customer: {
    id: "test-customer-id",
    email: "customer@example.com",
    first_name: "John",
    last_name: "Doe",
  },
} as CustomerCreatedPreviewProps;

export default CustomerCreatedTemplate;
