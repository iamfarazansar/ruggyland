# RuggyLand

Handcrafted rug e-commerce platform built with MedusaJS 2.0.

## Architecture

- **backend/** — MedusaJS 2.0 backend with custom modules (manufacturing, work orders, artisans)
- **storefront/** — Next.js storefront with multi-region support
- **management-app/** — Internal admin dashboard (analytics, orders, artisans, work orders)

## Tech Stack

- MedusaJS 2.0 (backend)
- Next.js 14 (storefront + management app)
- PostgreSQL + Redis
- MinIO (file storage)
- MeiliSearch (product search)
- PostHog (analytics)
- Stripe + Razorpay (payments)

## Deployment

- **Backend:** Railway
- **Storefront:** Vercel
- **Management App:** Vercel
