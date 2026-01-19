import { Resend } from "resend";
import { render } from "@react-email/components";
import { CustomerCreatedTemplate } from "../modules/email-notifications/templates/customer-created";
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

// Mock customer data
const mockCustomerData = {
  customer: {
    id: "test-customer-id",
    email: TEST_EMAIL,
    first_name: "John",
    last_name: "Doe",
  },
};

async function sendTestEmail() {
  console.log("🚀 Starting welcome email test...\n");

  if (!RESEND_API_KEY) {
    console.error("❌ RESEND_API_KEY is not set");
    process.exit(1);
  }

  const resend = new Resend(RESEND_API_KEY);

  // Render the email template
  const html = await render(CustomerCreatedTemplate(mockCustomerData));

  console.log(`📧 Sending test welcome email to: ${TEST_EMAIL}`);
  console.log(`📤 From: ${FROM_EMAIL}\n`);

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TEST_EMAIL,
      subject: "Welcome to RuggyLand! 🎉",
      html,
    });

    if (error) {
      console.error("❌ Error sending email:", error);
      process.exit(1);
    }

    console.log("✅ Welcome email sent successfully!");
    console.log(`📬 Email ID: ${data?.id}`);
    console.log(`\nCheck your inbox at: ${TEST_EMAIL}`);
  } catch (err) {
    console.error("❌ Failed to send email:", err);
    process.exit(1);
  }
}

sendTestEmail();
