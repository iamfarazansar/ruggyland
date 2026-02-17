"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { fetchAnalytics, type QueryType } from "@/lib/analytics";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type DateRange = 7 | 30 | 90;

interface ChartData {
  pageviews: Record<string, any>[];
  uniqueVisitors: Record<string, any>[];
  topPages: Record<string, any>[];
  topProducts: Record<string, any>[];
  addToCart: Record<string, any>[];
  orders: Record<string, any>[];
  signups: Record<string, any>[];
  countries: Record<string, any>[];
  devices: Record<string, any>[];
}

const PIE_COLORS = [
  "#f59e0b",
  "#3b82f6",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
  "#f97316",
  "#6366f1",
];

export default function AnalyticsPage() {
  const { token, isAuthenticated } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange>(30);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ChartData>({
    pageviews: [],
    uniqueVisitors: [],
    topPages: [],
    topProducts: [],
    addToCart: [],
    orders: [],
    signups: [],
    countries: [],
    devices: [],
  });

  const fetchAllData = useCallback(async (isRefresh = false) => {
    if (!token) return;
    if (!isRefresh) setLoading(true);
    else setRefreshing(true);
    setError(null);

    const queries: { key: keyof ChartData; type: QueryType }[] = [
      { key: "pageviews", type: "pageviews" },
      { key: "uniqueVisitors", type: "unique_visitors" },
      { key: "topPages", type: "top_pages" },
      { key: "topProducts", type: "top_products" },
      { key: "addToCart", type: "add_to_cart" },
      { key: "orders", type: "orders" },
      { key: "signups", type: "signups" },
      { key: "countries", type: "countries" },
      { key: "devices", type: "devices" },
    ];

    try {
      const newData: ChartData = { ...data };

      // Batch queries in groups of 3 to stay under PostHog's concurrency limit
      for (let i = 0; i < queries.length; i += 3) {
        const batch = queries.slice(i, i + 3);
        const results = await Promise.allSettled(
          batch.map((q) => fetchAnalytics(token, q.type, dateRange))
        );
        results.forEach((result, j) => {
          if (result.status === "fulfilled") {
            newData[batch[j].key] = result.value.results;
          } else {
            console.warn(`Failed to fetch ${batch[j].type}:`, result.reason);
            newData[batch[j].key] = [];
          }
        });
      }

      setData(newData);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || "Failed to load analytics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, dateRange]);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchAllData();
      const interval = setInterval(() => fetchAllData(true), 60_000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, token, fetchAllData]);

  const totalPageviews = data.pageviews.reduce(
    (sum, d) => sum + (d.count || 0),
    0
  );
  const totalVisitors = data.uniqueVisitors.reduce(
    (sum, d) => sum + (d.count || 0),
    0
  );
  const totalOrders = data.orders.reduce(
    (sum, d) => sum + (d.count || 0),
    0
  );
  const totalSignups = data.signups.reduce(
    (sum, d) => sum + (d.count || 0),
    0
  );

  // Merge pageviews and add-to-cart for the conversion chart
  const conversionData = data.pageviews.map((pv) => {
    const atc = data.addToCart.find((a) => a.day === pv.day);
    const ord = data.orders.find((o) => o.day === pv.day);
    return {
      day: formatDate(pv.day),
      "Page Views": pv.count || 0,
      "Add to Cart": atc?.count || 0,
      Orders: ord?.count || 0,
    };
  });

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-gray-600 dark:text-gray-400">
              Storefront performance and visitor insights
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
              <span className={`w-2 h-2 rounded-full bg-green-500 ${refreshing ? "animate-pulse" : ""}`}></span>
              Live
              {lastUpdated && (
                <span className="text-gray-400 dark:text-gray-500 ml-1">
                  · {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {([7, 30, 90] as DateRange[]).map((d) => (
            <button
              key={d}
              onClick={() => setDateRange(d)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                dateRange === d
                  ? "bg-amber-500 text-black"
                  : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-600 dark:text-yellow-400 text-sm">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <KPICard title="Visitors" value={totalVisitors} color="from-blue-500 to-blue-600" />
        <KPICard title="Page Views" value={totalPageviews} color="from-amber-500 to-orange-500" />
        <KPICard title="Orders" value={totalOrders} color="from-green-500 to-green-600" />
        <KPICard title="Signups" value={totalSignups} color="from-purple-500 to-purple-600" />
      </div>

      {/* Conversion Funnel Chart */}
      {conversionData.length > 0 && (
        <ChartCard title="Traffic & Conversions">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={conversionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#f3f4f6",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="Page Views"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="Add to Cart"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="Orders"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* Two column charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Top Products */}
        {data.topProducts.length > 0 && (
          <ChartCard title="Top Products Viewed">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={data.topProducts.map((p) => ({
                  name: truncate(p.product, 20),
                  count: p.count,
                }))}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={140}
                  tick={{ fontSize: 11 }}
                  stroke="#9ca3af"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#f3f4f6",
                  }}
                />
                <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Visitors by Country */}
        {data.countries.length > 0 && (
          <ChartCard title="Visitors by Country">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.countries.map((c) => ({
                    name: c.country,
                    value: c.count,
                  }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) =>
                    `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {data.countries.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#f3f4f6",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Top Pages */}
        {data.topPages.length > 0 && (
          <ChartCard title="Top Pages">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={data.topPages.map((p) => ({
                  name: truncateUrl(p.url),
                  count: p.count,
                }))}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={160}
                  tick={{ fontSize: 11 }}
                  stroke="#9ca3af"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#f3f4f6",
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Visitors by Device */}
        {data.devices.length > 0 && (
          <ChartCard title="Visitors by Device">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.devices.map((d) => ({
                    name: d.device || "Unknown",
                    value: d.count,
                  }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) =>
                    `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {data.devices.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#f3f4f6",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>

      {/* Empty state */}
      {!loading &&
        data.pageviews.length === 0 &&
        data.topProducts.length === 0 &&
        data.countries.length === 0 && (
          <div className="mt-8 text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No analytics data yet
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
              Make sure PostHog is configured on your backend (POSTHOG_PERSONAL_API_KEY and POSTHOG_PROJECT_ID)
            </p>
          </div>
        )}
    </div>
  );
}

function KPICard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: string;
}) {
  return (
    <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6 shadow-sm">
      <div
        className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${color} opacity-10 rounded-full -translate-y-6 translate-x-6`}
      ></div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
      <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function truncate(str: string, len: number): string {
  if (!str) return "";
  return str.length > len ? str.slice(0, len) + "..." : str;
}

function truncateUrl(url: string): string {
  if (!url) return "";
  try {
    const path = new URL(url).pathname;
    return path.length > 25 ? path.slice(0, 25) + "..." : path;
  } catch {
    return truncate(url, 25);
  }
}
