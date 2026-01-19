/**
 * Test script to send order confirmation email without creating an actual order
 *
 * Usage: npx tsx src/scripts/test-order-email.ts
 */

import { Resend } from "resend";
import { render } from "@react-email/components";
import { OrderPlacedTemplate } from "../modules/email-notifications/templates/order-placed";
import * as React from "react";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env file manually
const envPath = resolve(process.cwd(), ".env");
try {
  const envContent = readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const [key, ...values] = line.split("=");
    if (key && !process.env[key.trim()]) {
      process.env[key.trim()] = values.join("=").trim();
    }
  });
} catch (e) {
  // .env file not found, use existing env vars
}

// Configuration - Uses environment variables
const TEST_EMAIL = process.env.TEST_EMAIL || "webruggyland@gmail.com";
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "info@ruggyland.com";

// Mock order data
const mockOrderData = {
  order: {
    id: "test-order-123",
    display_id: "12345",
    created_at: new Date().toISOString(),
    email: TEST_EMAIL,
    currency_code: "eur",
    items: [
      {
        id: "item-1",
        title: "One Piece Straw Hat Rug",
        product_title: "One Piece Straw Hat Rug",
        quantity: 1,
        unit_price: 129.99,
        thumbnail:
          "https://ruggyland-qa1.s3.ap-southeast-2.amazonaws.com/product-placeholder.jpg",
      },
      {
        id: "item-2",
        title: "Naruto Hokage Rug",
        product_title: "Naruto Hokage Rug",
        quantity: 2,
        unit_price: 89.99,
        thumbnail: undefined, // Test without thumbnail
      },
    ],
    shipping_address: {
      first_name: "Test",
      last_name: "User",
      address_1: "123 Test Street",
      city: "London",
      province: "Greater London",
      postal_code: "SW1A 1AA",
      country_code: "GB",
    },
    summary: {
      raw_current_order_total: { value: 319.97 }, // Total including shipping
    },
  },
  shippingAddress: {
    first_name: "Test",
    last_name: "User",
    address_1: "123 Test Street",
    city: "London",
    province: "Greater London",
    postal_code: "SW1A 1AA",
    country_code: "GB",
  },
  shippingMethod: "Express Shipping (2-3 Days)",
  shippingTotal: 10, // €10 shipping
  estimatedDelivery: "January 26, 2026",
  trackingUrl: "https://ruggyland.com/account/orders/test-order-123",
};

async function sendTestEmail() {
  console.log("🚀 Starting email test...\n");

  if (!RESEND_API_KEY) {
    console.error("❌ RESEND_API_KEY not set");
    process.exit(1);
  }

  const resend = new Resend(RESEND_API_KEY);

  // Render the React email component to HTML
  const emailHtml = await render(
    React.createElement(OrderPlacedTemplate, mockOrderData as any),
  );

  console.log("📧 Sending test email to:", TEST_EMAIL);
  console.log("📤 From:", FROM_EMAIL);
  console.log("");

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TEST_EMAIL,
      subject: `[TEST] Order Confirmed - #${mockOrderData.order.display_id} | RuggyLand`,
      html: emailHtml,
      replyTo: "support@ruggyland.com",
    });

    if (error) {
      console.error("❌ Failed to send email:", error);
      process.exit(1);
    }

    console.log("✅ Email sent successfully!");
    console.log("📬 Email ID:", data?.id);
    console.log("");
    console.log("Check your inbox at:", TEST_EMAIL);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

sendTestEmail();
