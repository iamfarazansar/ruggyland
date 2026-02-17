import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

const POSTHOG_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY
const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID
const POSTHOG_HOST = process.env.POSTHOG_HOST || "https://us.i.posthog.com"

type QueryType =
  | "pageviews"
  | "unique_visitors"
  | "top_pages"
  | "top_products"
  | "add_to_cart"
  | "orders"
  | "signups"
  | "logins"
  | "countries"
  | "devices"

function buildHogQLQuery(queryType: QueryType, days: number): string {
  const dateFilter = `timestamp >= now() - interval ${days} day`

  switch (queryType) {
    case "pageviews":
      return `SELECT toDate(timestamp) as day, count() as count FROM events WHERE event = '$pageview' AND ${dateFilter} GROUP BY day ORDER BY day`

    case "unique_visitors":
      return `SELECT toDate(timestamp) as day, count(distinct distinct_id) as count FROM events WHERE event = '$pageview' AND ${dateFilter} GROUP BY day ORDER BY day`

    case "top_pages":
      return `SELECT properties.$current_url as url, count() as count FROM events WHERE event = '$pageview' AND ${dateFilter} AND properties.$current_url IS NOT NULL GROUP BY url ORDER BY count DESC LIMIT 10`

    case "top_products":
      return `SELECT properties.product_name as product, count() as count FROM events WHERE event = 'Product Viewed' AND ${dateFilter} AND properties.product_name IS NOT NULL GROUP BY product ORDER BY count DESC LIMIT 10`

    case "add_to_cart":
      return `SELECT toDate(timestamp) as day, count() as count FROM events WHERE event = 'Add to Cart' AND ${dateFilter} GROUP BY day ORDER BY day`

    case "orders":
      return `SELECT toDate(timestamp) as day, count() as count FROM events WHERE event = 'Order Completed' AND ${dateFilter} GROUP BY day ORDER BY day`

    case "signups":
      return `SELECT toDate(timestamp) as day, count() as count FROM events WHERE event = 'Customer Signup' AND ${dateFilter} GROUP BY day ORDER BY day`

    case "logins":
      return `SELECT toDate(timestamp) as day, count() as count FROM events WHERE event = 'Customer Login' AND ${dateFilter} GROUP BY day ORDER BY day`

    case "countries":
      return `SELECT properties.$geoip_country_name as country, count(distinct distinct_id) as count FROM events WHERE event = '$pageview' AND ${dateFilter} AND properties.$geoip_country_name IS NOT NULL GROUP BY country ORDER BY count DESC LIMIT 10`

    case "devices":
      return `SELECT properties.$device_type as device, count(distinct distinct_id) as count FROM events WHERE event = '$pageview' AND ${dateFilter} AND properties.$device_type IS NOT NULL GROUP BY device ORDER BY count DESC LIMIT 10`

    default:
      throw new Error(`Unknown query type: ${queryType}`)
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  if (!POSTHOG_API_KEY || !POSTHOG_PROJECT_ID) {
    return res.status(503).json({
      error: "PostHog is not configured. Set POSTHOG_PERSONAL_API_KEY and POSTHOG_PROJECT_ID environment variables.",
    })
  }

  const { queryType, days = 30 } = req.body as {
    queryType: QueryType
    days?: number
  }

  if (!queryType) {
    return res.status(400).json({ error: "queryType is required" })
  }

  try {
    const hogql = buildHogQLQuery(queryType, days)

    const response = await fetch(
      `${POSTHOG_HOST}/api/projects/${POSTHOG_PROJECT_ID}/query/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${POSTHOG_API_KEY}`,
        },
        body: JSON.stringify({
          query: {
            kind: "HogQLQuery",
            query: hogql,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("PostHog API error:", response.status, errorText)
      return res.status(response.status).json({
        error: "PostHog API request failed",
        details: errorText,
      })
    }

    const data = await response.json()

    // Transform HogQL results into a simpler format
    const columns = data.columns || []
    const results = (data.results || []).map((row: any[]) => {
      const obj: Record<string, any> = {}
      columns.forEach((col: string, i: number) => {
        obj[col] = row[i]
      })
      return obj
    })

    return res.json({ results, columns })
  } catch (error: any) {
    console.error("Analytics query error:", error)
    return res.status(500).json({ error: error.message || "Internal server error" })
  }
}
