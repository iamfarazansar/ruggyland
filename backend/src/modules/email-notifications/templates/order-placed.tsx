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
import { OrderDTO, OrderAddressDTO } from "@medusajs/framework/types";

export const ORDER_PLACED = "order-placed";

interface OrderItem {
  id: string;
  title: string;
  product_title: string;
  quantity: number;
  unit_price: number;
  thumbnail?: string;
}

interface OrderPlacedPreviewProps {
  order: OrderDTO & {
    display_id: string;
    summary: {
      raw_current_order_total: { value: number };
    };
    items: OrderItem[];
  };
  shippingAddress: OrderAddressDTO;
  shippingMethod?: string;
  shippingTotal?: number;
  estimatedDelivery?: string;
  trackingUrl?: string;
}

export interface OrderPlacedTemplateProps {
  order: OrderDTO & {
    display_id: string;
    summary: {
      raw_current_order_total: { value: number };
    };
    items: OrderItem[];
  };
  shippingAddress: OrderAddressDTO;
  billingAddress?: OrderAddressDTO;
  shippingMethod?: string;
  shippingTotal?: number;
  estimatedDelivery?: string;
  trackingUrl?: string;
  preview?: string;
}

export const isOrderPlacedTemplateData = (
  data: any,
): data is OrderPlacedTemplateProps =>
  typeof data.order === "object" && typeof data.shippingAddress === "object";

// Format currency helper
const formatCurrency = (amount: number, currency: string) => {
  const symbols: Record<string, string> = {
    usd: "$",
    eur: "€",
    gbp: "£",
    inr: "₹",
    dkk: "kr",
  };
  const symbol =
    symbols[currency?.toLowerCase()] || currency?.toUpperCase() + " ";
  return `${symbol}${Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const OrderPlacedTemplate: React.FC<OrderPlacedTemplateProps> & {
  PreviewProps: OrderPlacedPreviewProps;
} = ({
  order,
  shippingAddress,
  billingAddress,
  shippingMethod = "Standard Shipping",
  shippingTotal = 0,
  estimatedDelivery,
  trackingUrl = "https://ruggyland.com/account/orders",
  preview = "Your RuggyLand order is confirmed!",
}) => {
  const firstName = shippingAddress.first_name || "there";
  const currency = order.currency_code || "usd";
  const subtotal =
    Number(order.summary.raw_current_order_total?.value || 0) - shippingTotal;
  const total = Number(order.summary.raw_current_order_total?.value || 0);
  const deliveryDate =
    estimatedDelivery ||
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  const orderDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Use billing address if provided, otherwise fall back to shipping address
  const billAddr = billingAddress || shippingAddress;

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
                    We're Making Your Rug ✨
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
                    Hi <strong>{firstName}</strong>, thanks for your purchase —
                    your handmade rug(s) are now in production.
                  </p>
                  <p
                    style={{
                      fontSize: "15px",
                      color: "#666666",
                      margin: "16px 0 0",
                      lineHeight: "1.6",
                    }}
                  >
                    We'll keep you updated on your rug's journey from our
                    craftsmen's hands to your doorstep. Stay tuned! 🧵✨
                  </p>
                </td>
              </tr>
            </table>

            {/* Order Info Bar */}
            <table cellPadding="0" cellSpacing="0" style={{ width: "100%" }}>
              <tr>
                <td style={{ padding: "0 24px 16px" }}>
                  <div
                    style={{
                      backgroundColor: "#FAF8F5",
                      borderRadius: "10px",
                      padding: "14px 20px",
                      textAlign: "center",
                    }}
                  >
                    <span style={{ fontSize: "14px", color: "#6B5B4F" }}>
                      📦 Order <strong>#{order.display_id}</strong> •{" "}
                      {orderDate}
                    </span>
                  </div>
                </td>
              </tr>
            </table>

            {/* Track Order Button with Note */}
            <table cellPadding="0" cellSpacing="0" style={{ width: "100%" }}>
              <tr>
                <td style={{ padding: "8px 24px 24px", textAlign: "center" }}>
                  <a
                    href={trackingUrl}
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
                    Track My Order →
                  </a>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#999999",
                      margin: "12px 0 0",
                    }}
                  >
                    Tracking will be active once shipped.
                  </p>
                </td>
              </tr>
            </table>

            {/* Order Summary Divider */}
            <table cellPadding="0" cellSpacing="0" style={{ width: "100%" }}>
              <tr>
                <td style={{ padding: "0 24px" }}>
                  <div style={{ borderTop: "1px solid #E5E5E5" }}></div>
                </td>
              </tr>
            </table>

            {/* Order Summary */}
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
                    Order Summary
                  </h2>

                  {/* Product Items */}
                  {order.items.map((item, index) => (
                    <table
                      key={item.id}
                      cellPadding="0"
                      cellSpacing="0"
                      style={{ width: "100%", marginBottom: "12px" }}
                    >
                      <tr>
                        <td
                          style={{
                            padding: "12px 0",
                            width: "60px",
                            verticalAlign: "top",
                          }}
                        >
                          {item.thumbnail ? (
                            <img
                              src={item.thumbnail}
                              alt={item.title}
                              width="50"
                              height="50"
                              style={{
                                borderRadius: "8px",
                                display: "block",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "50px",
                                height: "50px",
                                backgroundColor: "#F0F0F0",
                                borderRadius: "8px",
                                textAlign: "center",
                                lineHeight: "50px",
                                fontSize: "20px",
                              }}
                            >
                              🏠
                            </div>
                          )}
                        </td>
                        <td
                          style={{ padding: "12px 12px", verticalAlign: "top" }}
                        >
                          <p
                            style={{
                              fontSize: "14px",
                              fontWeight: "600",
                              color: "#1a1a1a",
                              margin: "0 0 2px",
                            }}
                          >
                            {item.product_title || item.title}
                          </p>
                          <p
                            style={{
                              fontSize: "13px",
                              color: "#888888",
                              margin: "0",
                            }}
                          >
                            Qty: {item.quantity}
                          </p>
                        </td>
                        <td
                          style={{
                            padding: "12px 0",
                            textAlign: "right",
                            verticalAlign: "top",
                          }}
                        >
                          <p
                            style={{
                              fontSize: "14px",
                              fontWeight: "600",
                              color: "#1a1a1a",
                              margin: "0",
                            }}
                          >
                            {formatCurrency(
                              item.unit_price * item.quantity,
                              currency,
                            )}
                          </p>
                        </td>
                      </tr>
                      {index < order.items.length - 1 && (
                        <tr>
                          <td colSpan={3}>
                            <div
                              style={{ borderBottom: "1px solid #F0F0F0" }}
                            ></div>
                          </td>
                        </tr>
                      )}
                    </table>
                  ))}

                  {/* Price Breakdown */}
                  <table
                    cellPadding="0"
                    cellSpacing="0"
                    style={{ width: "100%", marginTop: "16px" }}
                  >
                    <tr>
                      <td style={{ padding: "6px 0" }}>
                        <span style={{ fontSize: "14px", color: "#666666" }}>
                          Subtotal
                        </span>
                      </td>
                      <td style={{ padding: "6px 0", textAlign: "right" }}>
                        <span style={{ fontSize: "14px", color: "#1a1a1a" }}>
                          {formatCurrency(subtotal, currency)}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "6px 0" }}>
                        <span style={{ fontSize: "14px", color: "#666666" }}>
                          Shipping
                        </span>
                      </td>
                      <td style={{ padding: "6px 0", textAlign: "right" }}>
                        <span
                          style={{
                            fontSize: "14px",
                            color: shippingTotal === 0 ? "#22C55E" : "#1a1a1a",
                          }}
                        >
                          {shippingTotal === 0
                            ? "Free"
                            : formatCurrency(shippingTotal, currency)}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} style={{ paddingTop: "12px" }}>
                        <div style={{ borderTop: "1px dashed #CCCCCC" }}></div>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "12px 0 0" }}>
                        <span
                          style={{
                            fontSize: "16px",
                            fontWeight: "700",
                            color: "#1a1a1a",
                          }}
                        >
                          Total
                        </span>
                      </td>
                      <td style={{ padding: "12px 0 0", textAlign: "right" }}>
                        <span
                          style={{
                            fontSize: "18px",
                            fontWeight: "700",
                            color: "#1a1a1a",
                          }}
                        >
                          {formatCurrency(total, currency)}
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            {/* Address & Payment Info - Stacked Full Width */}
            <table cellPadding="0" cellSpacing="0" style={{ width: "100%" }}>
              <tr>
                <td style={{ padding: "0 24px 24px" }}>
                  {/* Shipping Address */}
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
                        margin: "0 0 10px",
                      }}
                    >
                      📍 Shipping Address
                    </p>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#555555",
                        margin: "0",
                        lineHeight: "1.6",
                      }}
                    >
                      {shippingAddress.first_name} {shippingAddress.last_name}
                      <br />
                      {shippingAddress.address_1}
                      <br />
                      {shippingAddress.city},{" "}
                      {shippingAddress.country_code?.toUpperCase()}
                    </p>
                  </div>

                  {/* Billing Address */}
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
                        margin: "0 0 10px",
                      }}
                    >
                      🧾 Billing Address
                    </p>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#555555",
                        margin: "0",
                        lineHeight: "1.6",
                      }}
                    >
                      {billAddr.first_name} {billAddr.last_name}
                      <br />
                      {billAddr.address_1}
                      <br />
                      {billAddr.city}, {billAddr.country_code?.toUpperCase()}
                    </p>
                  </div>
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
                    Need help? Reply to this email or contact our team at{" "}
                    <a
                      href="mailto:info@ruggyland.com"
                      style={{ color: "#6B5B4F", fontWeight: "600" }}
                    >
                      info@ruggyland.com
                    </a>
                    . We're always here to assist you.
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

OrderPlacedTemplate.PreviewProps = {
  order: {
    id: "test-order-id",
    display_id: "10",
    created_at: new Date().toISOString(),
    email: "test@example.com",
    currency_code: "eur",
    items: [
      {
        id: "item-1",
        title: "Shanks Rug",
        product_title: "Shanks Rug",
        quantity: 1,
        unit_price: 180,
      },
      {
        id: "item-2",
        title: "Straw Hat Rug",
        product_title: "Straw Hat Rug",
        quantity: 1,
        unit_price: 180,
      },
    ],
    shipping_address: {
      first_name: "Test",
      last_name: "Test",
      address_1: "123 Test Street",
      city: "Redhill",
      province: "Surrey",
      postal_code: "RH1 1AA",
      country_code: "GB",
    },
    summary: {
      raw_current_order_total: { value: 360 },
    },
  },
  shippingAddress: {
    first_name: "Test",
    last_name: "Test",
    address_1: "123 Test Street",
    city: "Redhill",
    province: "Surrey",
    postal_code: "RH1 1AA",
    country_code: "GB",
  },
  shippingMethod: "Standard Shipping",
  shippingTotal: 0,
  estimatedDelivery: "January 26, 2026",
} as unknown as OrderPlacedPreviewProps;

export default OrderPlacedTemplate;
