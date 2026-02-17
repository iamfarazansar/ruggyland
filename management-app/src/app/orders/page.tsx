"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

interface OrderItem {
  id: string;
  title: string;
  quantity: number;
}

interface Order {
  id: string;
  display_id: number;
  email: string; // Order email (can be different from customer email)
  customer: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
  } | null;
  total: number;
  subtotal?: number;
  shipping_total?: number;
  currency_code: string;
  status: string;
  payment_status: string;
  fulfillment_status: string;
  created_at: string;
  items?: OrderItem[];
  summary?: {
    current_order_total: number;
    original_order_total: number;
    pending_difference: number;
    transaction_total: number;
  };
}

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

const ORDER_STATUS_COLORS: Record<string, string> = {
  canceled: "bg-red-500/20 text-red-400",
  cancelled: "bg-red-500/20 text-red-400",
  requires_action: "bg-yellow-500/20 text-yellow-400",
};

const FULFILLMENT_COLORS: Record<string, string> = {
  not_fulfilled: "bg-gray-500/20 text-gray-600 dark:text-gray-400",
  partially_fulfilled: "bg-blue-500/20 text-blue-400",
  fulfilled: "bg-green-500/20 text-green-400",
  shipped: "bg-purple-500/20 text-purple-400",
};

const PAYMENT_COLORS: Record<string, string> = {
  awaiting: "bg-yellow-500/20 text-yellow-400",
  captured: "bg-green-500/20 text-green-400",
  refunded: "bg-red-500/20 text-red-400",
  partially_refunded: "bg-orange-500/20 text-orange-400",
  not_paid: "bg-gray-500/20 text-gray-600 dark:text-gray-400",
};

export default function OrdersPage() {
  const { token, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [creatingWorkOrders, setCreatingWorkOrders] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchOrders();
    }
  }, [isAuthenticated, token]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      // Include customer fields and summary in the request
      // Medusa v2 uses summary object for order totals
      const fields = [
        "id",
        "display_id",
        "email",
        "total",
        "subtotal",
        "shipping_total",
        "currency_code",
        "status",
        "payment_status",
        "fulfillment_status",
        "created_at",
        "*customer",
        "*items",
        "*summary",
      ].join(",");

      const response = await fetch(
        `${BACKEND_URL}/admin/orders?limit=50&order=-created_at&fields=${encodeURIComponent(fields)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Orders data:", data.orders); // Debug log
        setOrders(data.orders || []);
      } else {
        throw new Error("Failed to fetch orders");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const createWorkOrders = async (orderId: string) => {
    setCreatingWorkOrders(orderId);

    try {
      const response = await fetch(
        `${BACKEND_URL}/admin/work-orders/from-order/${orderId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ priority: "normal" }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        alert(
          `Created ${data.work_orders?.length || 0} work order(s) for this order!`,
        );
      } else {
        alert(data.message || "Failed to create work orders");
      }
    } catch (err) {
      console.error("Error creating work orders:", err);
      alert("Failed to create work orders");
    } finally {
      setCreatingWorkOrders(null);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency?.toUpperCase() || "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.display_id?.toString().includes(searchQuery) ||
      order.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer?.email
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      order.customer?.first_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      order.customer?.last_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.fulfillment_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Orders
          </h1>
          <p className="text-gray-400 mt-1">
            Manage customer orders and create work orders
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition"
        >
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by order ID, customer email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          {/* Fulfillment Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Fulfillment</option>
            <option value="not_fulfilled">Not Fulfilled</option>
            <option value="partially_fulfilled">Partially Fulfilled</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="shipped">Shipped</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-500 mb-4">
        Showing {filteredOrders.length} of {orders.length} orders
      </p>

      {/* Orders Table */}
      {orders.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
          <p className="text-gray-400 text-lg mb-2">No orders yet</p>
          <p className="text-gray-500 text-sm">
            Orders will appear here when customers place them
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-100 dark:bg-gray-800/50">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Order
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Total
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Payment
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Fulfillment
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-100 dark:bg-gray-800/50 transition"
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          #{order.display_id}
                        </p>
                        {(order.status === "canceled" || order.status === "cancelled") && (
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[order.status]}`}>
                            cancelled
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {order.items?.length || 0} item(s)
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {order.customer?.first_name || order.customer?.last_name
                          ? `${order.customer?.first_name || ""} ${order.customer?.last_name || ""}`.trim()
                          : "Guest"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.email || order.customer?.email || "N/A"}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(
                        order.summary?.current_order_total ?? order.total ?? 0,
                        order.currency_code,
                      )}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${PAYMENT_COLORS[order.payment_status] || "bg-gray-500/20 text-gray-600 dark:text-gray-400"}`}
                    >
                      {order.payment_status?.replace("_", " ") || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${FULFILLMENT_COLORS[order.fulfillment_status] || "bg-gray-500/20 text-gray-600 dark:text-gray-400"}`}
                    >
                      {order.fulfillment_status?.replace(/_/g, " ") || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-300">
                      {formatDate(order.created_at)}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => createWorkOrders(order.id)}
                        disabled={creatingWorkOrders === order.id}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-black text-xs font-medium rounded-lg transition"
                        title="Create work orders for this order"
                      >
                        {creatingWorkOrders === order.id
                          ? "..."
                          : "+ Work Orders"}
                      </button>
                      <Link
                        href={`/orders/${order.id}`}
                        className="p-2 hover:bg-gray-700 rounded-lg transition"
                        title="View Details"
                      >
                        <svg
                          className="w-4 h-4 text-gray-600 dark:text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-blue-400 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="text-sm text-blue-300 font-medium">
              Create Work Orders
            </p>
            <p className="text-xs text-blue-400/70 mt-1">
              Click "+ Work Orders" to automatically create manufacturing work
              orders for each item in the order. This will create one work order
              per item quantity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
