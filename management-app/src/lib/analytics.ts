const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

export type QueryType =
  | "pageviews"
  | "unique_visitors"
  | "top_pages"
  | "top_products"
  | "add_to_cart"
  | "orders"
  | "signups"
  | "logins"
  | "countries"
  | "devices";

export interface AnalyticsResult {
  results: Record<string, any>[];
  columns: string[];
}

export async function fetchAnalytics(
  token: string,
  queryType: QueryType,
  days: number = 30
): Promise<AnalyticsResult> {
  const response = await fetch(`${BACKEND_URL}/admin/analytics`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ queryType, days }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}
