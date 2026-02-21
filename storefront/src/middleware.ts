import { HttpTypes } from "@medusajs/types"
import { NextRequest, NextResponse } from "next/server"

function maintenancePage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RuggyLand - We'll Be Right Back</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #1a1a1a;
      color: #feede7;
    }
    .container {
      text-align: center;
      padding: 2rem;
      max-width: 480px;
    }
    .logo {
      width: 120px;
      height: 120px;
      margin: 0 auto 1.5rem;
      display: block;
    }
    h1 {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
    }
    p {
      color: #a0a0a0;
      line-height: 1.6;
      margin-bottom: 2rem;
    }
    .instagram-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 500;
      font-size: 0.95rem;
      transition: opacity 0.2s;
    }
    .instagram-link:hover { opacity: 0.9; }
    .instagram-link svg {
      width: 20px;
      height: 20px;
      fill: white;
    }
    .refresh {
      display: block;
      margin-top: 1.5rem;
      color: #999;
      font-size: 0.85rem;
      text-decoration: none;
    }
    .refresh:hover { color: #ccc; }
  </style>
</head>
<body>
  <div class="container">
    <img class="logo" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjguODggMTI5LjY4Ij4KICA8ZGVmcz4KICAgIDxzdHlsZT4KICAgICAgLmNscy0xIHsKICAgICAgICBzdHJva2Utd2lkdGg6IDNweDsKICAgICAgfQoKICAgICAgLmNscy0xLCAuY2xzLTIgewogICAgICAgIHN0cm9rZTogI2ZlZWRlNzsKICAgICAgfQoKICAgICAgLmNscy0xLCAuY2xzLTIsIC5jbHMtMywgLmNscy00LCAuY2xzLTUgewogICAgICAgIHN0cm9rZS1taXRlcmxpbWl0OiAyODg7CiAgICAgIH0KCiAgICAgIC5jbHMtMSwgLmNscy0zIHsKICAgICAgICBmaWxsOiBub25lOwogICAgICB9CgogICAgICAuY2xzLTIsIC5jbHMtNCwgLmNscy02IHsKICAgICAgICBmaWxsLXJ1bGU6IGV2ZW5vZGQ7CiAgICAgIH0KCiAgICAgIC5jbHMtMiwgLmNscy00LCAuY2xzLTUgewogICAgICAgIHN0cm9rZS13aWR0aDogLjVweDsKICAgICAgfQoKICAgICAgLmNscy0yLCAuY2xzLTYgewogICAgICAgIGZpbGw6ICNmZWVkZTc7CiAgICAgIH0KCiAgICAgIC5jbHMtMyB7CiAgICAgICAgc3Ryb2tlOiAjYWJhYWFhOwogICAgICAgIHN0cm9rZS13aWR0aDogNXB4OwogICAgICB9CgogICAgICAuY2xzLTQgewogICAgICAgIGZpbGw6ICMxZjFhMTg7CiAgICAgICAgc3Ryb2tlOiAjMWYxYTE4OwogICAgICB9CgogICAgICAuY2xzLTUgewogICAgICAgIGZpbGw6ICNkZDE1N2I7CiAgICAgICAgc3Ryb2tlOiAjZGQxNTdiOwogICAgICB9CiAgICA8L3N0eWxlPgogIDwvZGVmcz4KICA8cGF0aCBpZD0iXzE3NDIxMjg4MCIgZGF0YS1uYW1lPSIgMTc0MjEyODgwIiBjbGFzcz0iY2xzLTYiIGQ9Ik05LjA0LDYxLjI1QzIxLjA1LDQwLjAyLDM3Ljg1LDIyLjQ1LDYwLjg0LDkuNDZjMi40Mi0xLjM3LDQuNzMtMS41Miw3LjAxLS4xMywyMS4wNSwxMi44MywzOC41MiwzMC4wMyw1Mi4wNSw1Mi4wNSwxLjQsMi4yOCwxLjM3LDQuNjgtLjEzLDcuMDEtMTQuMzUsMjIuMzctMzEuOTUsMzkuMDMtNTEuNzksNTEuNzktMi4zNCwxLjUtNC43MSwxLjQ5LTcuMDEsLjEzLTIyLjMyLTEzLjIzLTM5LjY3LTMwLjU4LTUyLjA1LTUyLjA1LTEuMzQtMi4zMi0xLjI0LTQuNiwuMTMtNy4wMWgwWiIvPgogIDxwYXRoIGlkPSJfMTc0MTg5NjcyIiBkYXRhLW5hbWU9IiAxNzQxODk2NzIiIGNsYXNzPSJjbHMtMSIgZD0iTTIuNyw2MC44MUMxNi4wOSwzNy4wMSwzNC44LDE3LjMxLDYwLjQyLDIuNzNjMi42OS0xLjUzLDUuMjctMS43LDcuODItLjE0LDIzLjQ2LDE0LjM5LDQyLjkzLDMzLjY4LDU4LDU4LjM2LDEuNTYsMi41NiwxLjUzLDUuMjQtLjE0LDcuODctMTUuOTksMjUuMDgtMzUuNjEsNDMuNzctNTcuNzIsNTguMDgtMi42LDEuNjgtNS4yNSwxLjY3LTcuODIsLjE0LTI0Ljg4LTE0Ljg0LTQ0LjIxLTM0LjI5LTU4LTU4LjM2LTEuNDktMi42LTEuMzgtNS4xNiwuMTQtNy44N2gwWiIvPgogIDxwYXRoIGlkPSJfMTc0MjE2NTUyIiBkYXRhLW5hbWU9IiAxNzQyMTY1NTIiIGNsYXNzPSJjbHMtMyIgZD0iTTYuNTIsNjEuMDdDMTkuMDgsMzguNzgsMzYuNjQsMjAuMzIsNjAuNjcsNi42OGMyLjUzLTEuNDMsNC45NC0xLjYsNy4zMy0uMTMsMjIuMDEsMTMuNDcsNDAuMjcsMzEuNTQsNTQuNDIsNTQuNjYsMS40NywyLjQsMS40NCw0LjkxLS4xMyw3LjM3LTE1LDIzLjQ5LTMzLjQxLDQwLjk5LTU0LjE1LDU0LjM5LTIuNDQsMS41OC00LjkyLDEuNTctNy4zMywuMTMtMjMuMzQtMTMuOS00MS40OC0zMi4xMi01NC40Mi01NC42Ni0xLjQtMi40NC0xLjMtNC44MywuMTMtNy4zN2gwWiIvPgogIDxwYXRoIGlkPSJfMTc0MjA1NjgwIiBkYXRhLW5hbWU9IiAxNzQyMDU2ODAiIGNsYXNzPSJjbHMtNCIgZD0iTTYuMjEsNTcuNzd2MTQuNDdoMi4xOHMwLTQuMjUsMC00LjI1aDMuMjlsMi40OCw0LjExLDIuMy0uMDMtMi42MS00LjY4YzMuNTQtMy43LDIuMzYtOC45LTEuODUtOS42NmwtNS43OSwuMDRoMFoiLz4KICA8cGF0aCBpZD0iXzE3NDIwNTEwNCIgZGF0YS1uYW1lPSIgMTc0MjA1MTA0IiBjbGFzcz0iY2xzLTIiIGQ9Ik04LjUxLDYwbC4wMiw1Ljc3LDMuMi0uMDJjLjk0LS4xNiwxLjY1LS45LDEuOTEtMi4wMXYtMS44M2MtLjIyLTEuMS0xLjExLTEuODgtMi4wOS0yLjA3aC0zLjAzcy0uMDIsLjE2LS4wMiwuMTZaIi8+CiAgPHBhdGggaWQ9Il8xNzQyMTc1MzYiIGRhdGEtbmFtZT0iIDE3NDIxNzUzNiIgY2xhc3M9ImNscy00IiBkPSJNMTkuNjUsNTcuODRjLS4wMiwzLjI0LS4wNCw2LjQ3LS4wNSw5LjcxLC4yOSwyLjc0LDEuNjIsNC4yMywzLjgsNC42OSwuOTcsMCwxLjk0LDAsMi45MSwwLDEuOC0uMzYsMy4yNC0xLjg0LDMuNjQtNC4xMmwuMDMtNi45MmMtLjczLS40MS0xLjQ2LS40MS0yLjE5LDB2Ni41N2MtLjQ5LDMtNS41NywzLjAzLTYtLjAzdi05Ljg5Yy0uNjYtLjQzLTEuNS0uNC0yLjE0LDBaIi8+CiAgPHBhdGggaWQ9Il8xNzQyMTk1NTIiIGRhdGEtbmFtZT0iIDE3NDIxOTU1MiIgY2xhc3M9ImNscy00IiBkPSJNOTguNzgsNzEuOTJjLS4wMi0zLjI0LS4wNC02LjQ3LS4wNS05LjcxLC4yOS0yLjc0LDEuNjItNC4yMywzLjgtNC42OSwuOTcsMCwxLjk0LDAsMi45MSwwLDEuOCwuMzYsMy4yNCwxLjg0LDMuNjQsNC4xMmwuMDMsNi45MmMtLjczLC40MS0xLjQ2LC40MS0yLjE5LDB2LTYuNTdjLS40OS0zLTUuNTctMy4wMy02LC4wM3Y5Ljg5Yy0uNjYsLjQzLTEuNSwuNC0yLjE0LDBaIi8+CiAgPHBhdGggaWQ9Il8xNzQyMjAxNzYiIGRhdGEtbmFtZT0iIDE3NDIyMDE3NiIgY2xhc3M9ImNscy00IiBkPSJNODQuNzQsNzEuOTJjLS4wMi0zLjI0LS4wNC02LjQ3LS4wNS05LjcxLC4yOS0yLjc0LDEuNjItNC4yMywzLjgtNC42OSwuOTcsMCwxLjk0LDAsMi45MSwwLDEuOCwuMzYsMy4yNCwxLjg0LDMuNjQsNC4xMmwuMDMsMTAuMmMtLjczLC40MS0xLjQ2LC40MS0yLjE5LDB2LTkuODVjLS40OS0zLTUuNTctMy4wMy02LC4wM3Y5Ljg5Yy0uNjYsLjQzLTEuNSwuNC0yLjE0LDBoMFoiLz4KICA8cGF0aCBpZD0iXzE3NDIyMDcyOCIgZGF0YS1uYW1lPSIgMTc0MjIwNzI4IiBjbGFzcz0iY2xzLTQiIGQ9Ik00My42Nyw2MS4yNGMtLjIzLC40Ny0xLjEzLC43My0xLjkyLC41LS41MS0uODYtMS4xOC0xLjU3LTIuMDgtMi4wNmgtMi4xMWMtLjkyLC4xMy0xLjUxLC45MS0xLjc1LDEuODgsMCwyLjA2LDAsNC4xMywwLDYuMTksLjA2LDEuMDgsLjU2LDEuODgsMS42OSwyLjI4LC42NywwLDEuMzMsMCwyLDAsMS41Ni0uNTMsMS44OS0xLjYyLDEuNjItMy4xMWgtMS4zOGMtLjk4LS4xNi0xLjE4LTEuNzcsMC0yLjE3aDMuOTV2Mi4yM2MuMDIsMi43My0xLjAxLDQuMjUtMy4zNCw1LjJoLTMuMzdjLTIuMTctLjUxLTMuNjEtMi4xNy0zLjYxLTQuODh2LTQuNDVjLjA0LTIuODQsMS41NC00Ljk4LDQuMTUtNS40NWgyLjRjMS40MSwuMzcsMy4zOCwyLjIxLDMuNzcsMy44NGgwWiIvPgogIDxwYXRoIGlkPSJfMTc0MjIxMjU2IiBkYXRhLW5hbWU9IiAxNzQyMjEyNTYiIGNsYXNzPSJjbHMtNCIgZD0iTTU3LjM3LDYxLjI0Yy0uMjMsLjQ3LTEuMTMsLjczLTEuOTIsLjUtLjUxLS44Ni0xLjE4LTEuNTctMi4wOC0yLjA2aC0yLjExYy0uOTIsLjEzLTEuNTEsLjkxLTEuNzUsMS44OCwwLDIuMDYsMCw0LjEzLDAsNi4xOSwuMDYsMS4wOCwuNTYsMS44OCwxLjY5LDIuMjgsLjY3LDAsMS4zMywwLDIsMCwxLjU2LS41MywxLjg5LTEuNjIsMS42Mi0zLjExaC0xLjM4Yy0uOTgtLjE2LTEuMTgtMS43NywwLTIuMTdoMy45NXYyLjIzYy4wMiwyLjczLTEuMDEsNC4yNS0zLjM0LDUuMmgtMy4zN2MtMi4xNy0uNTEtMy42MS0yLjE3LTMuNjEtNC44OHYtNC40NWMuMDQtMi44NCwxLjU0LTQuOTgsNC4xNS01LjQ1aDIuNGMxLjQxLC4zNywzLjM4LDIuMjEsMy43NywzLjg0aDBaIi8+CiAgPHBhdGggaWQ9Il8xNzQyMTUwMTYiIGRhdGEtbmFtZT0iIDE3NDIxNTAxNiIgY2xhc3M9ImNscy00IiBkPSJNNzMuMzksNTguMTh2OS42NmMuMjcsMi4zNywxLjksMy44OSwzLjY4LDQuMjdoNC43Yy4yMS0uNDUsLjI0LTEuNzQtLjAxLTIuMjVsLTMuNzQtLjA2Yy0xLjI4LS4xNy0yLjE0LS45NC0yLjM3LTIuMTksMC0zLjE0LDAtNi4yOS0uMDEtOS40My0uMjgtLjgtMS45NC0uODMtMi4yNCwwaDBaIi8+CiAgPHBhdGggaWQ9Il8xNzQyMTY3NDQiIGRhdGEtbmFtZT0iIDE3NDIxNjc0NCIgY2xhc3M9ImNscy00IiBkPSJNNTkuOTksNTguMTh2My42OGMuMjgsMS42NiwxLjkyLDMuMzIsNC4wOSwzLjk3djUuOTZoMi4yOHYtNS44MmMxLjU4LS42NiwyLjc1LTEuNzYsMy41NC0zLjIyLC43NS0xLjg2LC4yMS0yLjA0LTEuNDEtMS4zOC0uNzksLjg4LTEuNDEsMS44Mi0yLjI5LDIuMDZoLTEuODljLTEtLjE3LTEuNzQtLjg4LTEuODktMS45NXYtMy4yNWMtLjM1LS44NC0xLjk1LS44OS0yLjQ0LS4wNWgwWiIvPgogIDxwYXRoIGlkPSJfMTc0MjE1MDg4IiBkYXRhLW5hbWU9IiAxNzQyMTUwODgiIGNsYXNzPSJjbHMtNCIgZD0iTTExMi44OCw1Ny43MXYxMy45M2wuODgsLjM3YzEuNDksMCwyLjk4LDAsNC40Ny0uMDIsMi4yNy0uMTQsMy44NC0xLjU2LDQuMzgtNC44N3YtNC40N2MtLjAzLTIuNi0xLjM3LTQuMjYtNC4wMS00Ljk3aC01LjcxczAsLjAxLDAsLjAxWiIvPgogIDxwYXRoIGlkPSJfMTc0MjA3MDQ4IiBkYXRhLW5hbWU9IiAxNzQyMDcwNDgiIGNsYXNzPSJjbHMtMiIgZD0iTTExNS4xOSw1OS44N3Y5LjcybC40NiwuMjZjLjc4LDAsMS41NiwwLDIuMzQtLjAxLDEuMTktLjEsMi4wMi0xLjA5LDIuMy0zLjM5di0zLjEyYy0uMDItMS44Mi0uNzItMi45Ny0yLjExLTMuNDdoLTNzMCwwLDAsMFoiLz4KICA8Y2lyY2xlIGlkPSJfMTc0MTg5MzYwIiBkYXRhLW5hbWU9IiAxNzQxODkzNjAiIGNsYXNzPSJjbHMtNSIgY3g9IjEwNy44NSIgY3k9IjcwLjkxIiByPSIxLjIxIi8+CiAgPGNpcmNsZSBpZD0iXzE3NDIwNzA3MiIgZGF0YS1uYW1lPSIgMTc0MjA3MDcyIiBjbGFzcz0iY2xzLTUiIGN4PSI4OS44OCIgY3k9IjY0Ljg4IiByPSIxLjIxIi8+CiAgPGNpcmNsZSBpZD0iXzE3NDIwMzYxNiIgZGF0YS1uYW1lPSIgMTc0MjAzNjE2IiBjbGFzcz0iY2xzLTUiIGN4PSI2OS4yNCIgY3k9IjU4LjgzIiByPSIxLjIxIi8+CiAgPGNpcmNsZSBpZD0iXzE3NDIwNDk4NCIgZGF0YS1uYW1lPSIgMTc0MjA0OTg0IiBjbGFzcz0iY2xzLTUiIGN4PSIyOC44IiBjeT0iNTguOTUiIHI9IjEuMjEiLz4KPC9zdmc+" alt="RuggyLand" />
    <h1>We'll Be Right Back</h1>
    <p>We're doing a quick update to bring you an even better experience. In the meantime, check out our behind-the-scenes on Instagram!</p>
    <a href="https://www.instagram.com/ruggyland/" target="_blank" rel="noopener noreferrer" class="instagram-link">
      <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
      Follow @ruggyland
    </a>
    <a href="javascript:location.reload()" class="refresh">Try refreshing the page</a>
  </div>
</body>
</html>`
}

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "us"

const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: Date.now(),
}

async function getRegionMap(cacheId: string) {
  const { regionMap, regionMapUpdated } = regionMapCache

  if (!BACKEND_URL) {
    throw new Error(
      "Middleware.ts: Error fetching regions. Did you set up regions in your Medusa Admin and define a MEDUSA_BACKEND_URL environment variable? Note that the variable is no longer named NEXT_PUBLIC_MEDUSA_BACKEND_URL."
    )
  }

  if (
    !regionMap.keys().next().value ||
    regionMapUpdated < Date.now() - 3600 * 1000
  ) {
    // Fetch regions from Medusa. We can't use the JS client here because middleware is running on Edge and the client needs a Node environment.
    const { regions } = await fetch(`${BACKEND_URL}/store/regions`, {
      headers: {
        "x-publishable-api-key": PUBLISHABLE_API_KEY!,
      },
      next: {
        revalidate: 3600,
        tags: [`regions-${cacheId}`],
      },
      cache: "force-cache",
    }).then(async (response) => {
      const json = await response.json()

      if (!response.ok) {
        throw new Error(json.message)
      }

      return json
    })

    if (!regions?.length) {
      throw new Error(
        "No regions found. Please set up regions in your Medusa Admin."
      )
    }

    // Create a map of country codes to regions.
    regions.forEach((region: HttpTypes.StoreRegion) => {
      region.countries?.forEach((c) => {
        regionMapCache.regionMap.set(c.iso_2 ?? "", region)
      })
    })

    regionMapCache.regionMapUpdated = Date.now()
  }

  return regionMapCache.regionMap
}

/**
 * Fetches regions from Medusa and sets the region cookie.
 * @param request
 * @param response
 */
async function getCountryCode(
  request: NextRequest,
  regionMap: Map<string, HttpTypes.StoreRegion | number>
) {
  try {
    let countryCode

    const cfCountryCode = request.headers
      .get("cf-ipcountry")
      ?.toLowerCase()

    const vercelCountryCode = request.headers
      .get("x-vercel-ip-country")
      ?.toLowerCase()

    const urlCountryCode = request.nextUrl.pathname.split("/")[1]?.toLowerCase()

    if (urlCountryCode && regionMap.has(urlCountryCode)) {
      countryCode = urlCountryCode
    } else if (cfCountryCode && cfCountryCode !== "xx" && regionMap.has(cfCountryCode)) {
      countryCode = cfCountryCode
    } else if (vercelCountryCode && regionMap.has(vercelCountryCode)) {
      countryCode = vercelCountryCode
    } else if (regionMap.has(DEFAULT_REGION)) {
      countryCode = DEFAULT_REGION
    } else if (regionMap.keys().next().value) {
      countryCode = regionMap.keys().next().value
    }

    return countryCode
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "Middleware.ts: Error getting the country code. Did you set up regions in your Medusa Admin and define a MEDUSA_BACKEND_URL environment variable? Note that the variable is no longer named NEXT_PUBLIC_MEDUSA_BACKEND_URL."
      )
    }
  }
}

/**
 * Middleware to handle region selection and onboarding status.
 */
export async function middleware(request: NextRequest) {
  let redirectUrl = request.nextUrl.href

  let response = NextResponse.redirect(redirectUrl, 307)

  let cacheIdCookie = request.cookies.get("_medusa_cache_id")

  let cacheId = cacheIdCookie?.value || crypto.randomUUID()

  let regionMap: Map<string, HttpTypes.StoreRegion> | undefined
  try {
    regionMap = await getRegionMap(cacheId)
  } catch (error) {
    console.error("Middleware: Failed to fetch regions:", error)
    return new NextResponse(maintenancePage(), {
      status: 503,
      headers: {
        "Content-Type": "text/html",
        "Retry-After": "30",
      },
    })
  }

  // If region map was served from cache, verify the backend is still reachable
  if (regionMap && BACKEND_URL) {
    try {
      const healthCheck = await fetch(`${BACKEND_URL}/health`, {
        signal: AbortSignal.timeout(5000),
      })
      if (!healthCheck.ok) throw new Error("Backend unhealthy")
    } catch {
      return new NextResponse(maintenancePage(), {
        status: 503,
        headers: {
          "Content-Type": "text/html",
          "Retry-After": "30",
        },
      })
    }
  }

  const countryCode = regionMap && (await getCountryCode(request, regionMap))

  const urlHasCountryCode =
    countryCode && request.nextUrl.pathname.split("/")[1].includes(countryCode)

  // if one of the country codes is in the url and the cache id is set, return next
  if (urlHasCountryCode && cacheIdCookie) {
    return NextResponse.next()
  }

  // if one of the country codes is in the url and the cache id is not set, set the cache id and redirect
  if (urlHasCountryCode && !cacheIdCookie) {
    response.cookies.set("_medusa_cache_id", cacheId, {
      maxAge: 60 * 60 * 24,
    })

    return response
  }

  // check if the url is a static asset
  if (request.nextUrl.pathname.includes(".")) {
    return NextResponse.next()
  }

  const redirectPath =
    request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname

  const queryString = request.nextUrl.search ? request.nextUrl.search : ""

  // If no country code is set, we redirect to the relevant region.
  if (!urlHasCountryCode && countryCode) {
    redirectUrl = `${request.nextUrl.origin}/${countryCode}${redirectPath}${queryString}`
    response = NextResponse.redirect(`${redirectUrl}`, 307)
  } else if (!urlHasCountryCode && !countryCode) {
    // Handle case where no valid country code exists (empty regions)
    return new NextResponse(
      "No valid regions configured. Please set up regions with countries in your Medusa Admin.",
      { status: 500 }
    )
  }

  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}
