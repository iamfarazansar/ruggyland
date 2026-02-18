import { getBaseURL } from "@lib/util/env"
import { Metadata, Viewport } from "next"
import "styles/globals.css"
import { Analytics } from "@vercel/analytics/next"
import PostHogProvider from "@lib/posthog/provider"
import MetaPixelProvider from "@lib/meta-pixel/provider"
import { Suspense } from "react"
import PageViewTracker from "@lib/posthog/pageview"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
      <body>
        <PostHogProvider>
          <Suspense fallback={null}>
            <PageViewTracker />
          </Suspense>
          <main className="relative">{props.children}</main>
        </PostHogProvider>
        <MetaPixelProvider />
        <Analytics />
      </body>
    </html>
  )
}
