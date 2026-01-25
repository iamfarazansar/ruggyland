"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { STAGE_LABELS, STAGE_COLORS, ManufacturingStage } from "@/lib/types";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

interface OrderItem {
  id: string;
  title: string;
  subtitle: string;
  thumbnail: string | null;
  quantity: number;
  unit_price: number;
  total: number;
  variant_title: string;
  product_title: string;
}

interface Order {
  id: string;
  display_id: number;
  email: string;
  status: string;
  payment_status: string;
  fulfillment_status: string;
  currency_code: string;
  total: number;
  subtotal: number;
  tax_total: number;
  shipping_total: number;
  discount_total: number;
  created_at: string;
  customer: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
  } | null;
  shipping_address: {
    first_name: string;
    last_name: string;
    address_1: string;
    address_2?: string;
    city: string;
    province?: string;
    postal_code: string;
    country_code: string;
    phone?: string;
  } | null;
  billing_address: {
    first_name: string;
    last_name: string;
    address_1: string;
    address_2?: string;
    city: string;
    province?: string;
    postal_code: string;
    country_code: string;
  } | null;
  items: OrderItem[];
  shipping_methods: {
    id: string;
    name: string;
    amount: number;
  }[];
  fulfillments?: {
    id: string;
    shipped_at?: string;
    created_at: string;
  }[];
}

interface WorkOrder {
  id: string;
  title: string;
  current_stage: ManufacturingStage;
  status: string;
  priority: string;
}

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

export default function OrderDetailPage() {
  const params = useParams();
  const { token, isAuthenticated } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingWorkOrders, setCreatingWorkOrders] = useState(false);
  const [fulfilling, setFulfilling] = useState(false);
  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const orderId = params.id as string;

  useEffect(() => {
    if (isAuthenticated && token && orderId) {
      fetchOrder();
      fetchWorkOrders();
    }
  }, [isAuthenticated, token, orderId]);

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/admin/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
      } else {
        throw new Error("Failed to fetch order");
      }
    } catch (err) {
      console.error("Error fetching order:", err);
      setError("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkOrders = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/admin/work-orders?order_id=${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setWorkOrders(data.work_orders || []);
      }
    } catch (err) {
      console.error("Error fetching work orders:", err);
    }
  };

  const createWorkOrders = async () => {
    setCreatingWorkOrders(true);
    setActionMessage(null);

    try {
      // Use the proxy route
      const response = await fetch(`/api/work-orders/from-order/${orderId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priority: "normal" }),
      });

      const data = await response.json();

      if (response.ok) {
        const created = data.work_orders?.length || 0;
        const skipped = data.skipped || 0;
        setActionMessage({
          type: "success",
          text: `✅ Created ${created} work order(s)${skipped > 0 ? `, ⏭️ Skipped ${skipped} (already existed)` : ""}`,
        });
        fetchWorkOrders();
      } else {
        setActionMessage({
          type: "error",
          text: data.message || "Failed to create work orders",
        });
      }
    } catch (err) {
      console.error("Error creating work orders:", err);
      setActionMessage({
        type: "error",
        text: "Failed to create work orders",
      });
    } finally {
      setCreatingWorkOrders(false);
    }
  };

  const fulfillOrder = async () => {
    if (!order) return;

    setFulfilling(true);
    setActionMessage(null);

    try {
      // Get items for fulfillment
      const items = order.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
      }));

      // Use the proxy route
      const response = await fetch(`/api/orders/${orderId}/fulfill`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items }),
      });

      const data = await response.json();

      if (response.ok) {
        setActionMessage({
          type: "success",
          text: "✅ Order fulfilled successfully!",
        });
        fetchOrder(); // Refresh order to update fulfillment status
      } else {
        setActionMessage({
          type: "error",
          text: data.message || "Failed to fulfill order",
        });
      }
    } catch (err) {
      console.error("Error fulfilling order:", err);
      setActionMessage({
        type: "error",
        text: "Failed to fulfill order",
      });
    } finally {
      setFulfilling(false);
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
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate manufacturing stage summary
  const getStageSummary = () => {
    const summary: Record<string, number> = {};
    workOrders.forEach((wo) => {
      summary[wo.current_stage] = (summary[wo.current_stage] || 0) + 1;
    });
    return summary;
  };

  // Check if all work orders are ready to ship
  const allReadyToShip =
    workOrders.length > 0 &&
    workOrders.every(
      (wo) => wo.current_stage === "ready_to_ship" || wo.status === "completed",
    );

  // Check if order is already fulfilled
  const isAlreadyFulfilled =
    order?.fulfillment_status === "fulfilled" ||
    order?.fulfillment_status === "shipped";

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading order details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-8">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
          <p className="text-red-400">{error || "Order not found"}</p>
          <Link
            href="/orders"
            className="mt-4 inline-block text-amber-500 hover:text-amber-400"
          >
            ← Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const stageSummary = getStageSummary();

  return (
    <div className="p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Link
              href="/orders"
              className="text-gray-400 hover:text-gray-900 dark:text-white"
            >
              ← Back
            </Link>
            <span className="text-gray-600">|</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Order #{order.display_id}
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {formatDate(order.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${PAYMENT_COLORS[order.payment_status] || "bg-gray-500/20 text-gray-600 dark:text-gray-400"}`}
          >
            {order.payment_status?.replace("_", " ")}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${FULFILLMENT_COLORS[order.fulfillment_status] || "bg-gray-500/20 text-gray-600 dark:text-gray-400"}`}
          >
            {order.fulfillment_status?.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      {/* Action Message */}
      {actionMessage && (
        <div
          className={`mb-6 p-4 rounded-xl text-sm ${
            actionMessage.type === "success"
              ? "bg-green-500/10 border border-green-500/20 text-green-400"
              : "bg-red-500/10 border border-red-500/20 text-red-400"
          }`}
        >
          {actionMessage.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Items & Work Orders */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Items
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 bg-gray-100 dark:bg-gray-800/50 rounded-lg"
                >
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-700 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500 text-xs">No image</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-gray-900 dark:text-white font-medium">
                      {item.product_title || item.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {item.variant_title || item.subtitle}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Qty: {item.quantity}
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {formatCurrency(item.total, order.currency_code)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 space-y-2">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>
                  {formatCurrency(order.subtotal || 0, order.currency_code)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Shipping</span>
                <span>
                  {formatCurrency(
                    order.shipping_total || 0,
                    order.currency_code,
                  )}
                </span>
              </div>
              {order.discount_total > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Discount</span>
                  <span>
                    -{formatCurrency(order.discount_total, order.currency_code)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Tax</span>
                <span>
                  {formatCurrency(order.tax_total || 0, order.currency_code)}
                </span>
              </div>
              <div className="flex justify-between text-gray-900 dark:text-white text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-800">
                <span>Total</span>
                <span>{formatCurrency(order.total, order.currency_code)}</span>
              </div>
            </div>
          </div>

          {/* Manufacturing Panel */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Manufacturing
              </h2>
              <span className="text-sm text-gray-500">
                {workOrders.length} work order(s)
              </span>
            </div>

            {/* Stage Summary */}
            {workOrders.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {Object.entries(stageSummary).map(([stage, count]) => (
                  <span
                    key={stage}
                    className={`px-3 py-1 rounded-full text-xs font-medium text-white ${STAGE_COLORS[stage as ManufacturingStage] || "bg-gray-500"}`}
                  >
                    {STAGE_LABELS[stage as ManufacturingStage] || stage}:{" "}
                    {count}
                  </span>
                ))}
              </div>
            )}

            {/* Work Order Actions */}
            <div className="flex flex-wrap gap-3 mb-4">
              {workOrders.length === 0 ? (
                <button
                  onClick={createWorkOrders}
                  disabled={creatingWorkOrders}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-medium rounded-lg transition flex items-center gap-2"
                >
                  {creatingWorkOrders ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Create Work Orders
                    </>
                  )}
                </button>
              ) : (
                <Link
                  href="/work-orders"
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium rounded-lg transition"
                >
                  View All Work Orders
                </Link>
              )}
            </div>

            {/* Work Orders List */}
            {workOrders.length > 0 ? (
              <div className="space-y-3">
                {workOrders.map((wo) => (
                  <Link
                    key={wo.id}
                    href={`/work-orders/${wo.id}`}
                    className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800/50 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition"
                  >
                    <div>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {wo.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {STAGE_LABELS[wo.current_stage] || wo.current_stage}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          wo.status === "completed"
                            ? "bg-green-500/20 text-green-400"
                            : wo.status === "in_progress"
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {wo.status.replace("_", " ")}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No work orders created yet</p>
                <p className="text-sm mt-1">
                  Click the button above to create work orders for this order
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Customer, Shipping & Operations */}
        <div className="space-y-6">
          {/* Operations Panel */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Operations
            </h2>

            {/* Print Documents */}
            <div className="space-y-3 mb-6">
              <p className="text-sm text-gray-500 font-medium">
                Print Documents
              </p>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg transition flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                    />
                  </svg>
                  Invoice / Packing Slip
                </button>
              </div>
            </div>

            {/* Fulfillment Actions */}
            <div className="space-y-3">
              <p className="text-sm text-gray-500 font-medium">Fulfillment</p>

              {isAlreadyFulfilled ? (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-green-400 text-sm font-medium flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Order Fulfilled
                  </p>
                </div>
              ) : (
                <>
                  {!allReadyToShip && workOrders.length > 0 && (
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-400 text-xs">
                      ⚠️ Waiting for all work orders to be ready to ship
                    </div>
                  )}
                  <button
                    onClick={fulfillOrder}
                    disabled={
                      fulfilling || (!allReadyToShip && workOrders.length > 0)
                    }
                    className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {fulfilling ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Fulfilling...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                          />
                        </svg>
                        Fulfill Order (Dispatch)
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Customer */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Customer
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="text-gray-900 dark:text-white">
                  {order.customer?.first_name || order.customer?.last_name
                    ? `${order.customer?.first_name || ""} ${order.customer?.last_name || ""}`.trim()
                    : "Guest"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-900 dark:text-white">
                  {order.email || order.customer?.email || "N/A"}
                </p>
              </div>
              {order.customer?.phone && (
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-gray-900 dark:text-white">
                    {order.customer.phone}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          {order.shipping_address && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Shipping Address
              </h2>
              <div className="text-gray-600 dark:text-gray-300 space-y-1">
                <p>
                  {order.shipping_address.first_name}{" "}
                  {order.shipping_address.last_name}
                </p>
                <p>{order.shipping_address.address_1}</p>
                {order.shipping_address.address_2 && (
                  <p>{order.shipping_address.address_2}</p>
                )}
                <p>
                  {order.shipping_address.city},{" "}
                  {order.shipping_address.province}{" "}
                  {order.shipping_address.postal_code}
                </p>
                <p className="uppercase">
                  {order.shipping_address.country_code}
                </p>
                {order.shipping_address.phone && (
                  <p className="text-gray-500 mt-2">
                    {order.shipping_address.phone}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Shipping Method */}
          {order.shipping_methods?.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Shipping Method
              </h2>
              {order.shipping_methods.map((method) => (
                <div key={method.id} className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    {method.name}
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {formatCurrency(method.amount, order.currency_code)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Billing Address */}
          {order.billing_address && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Billing Address
              </h2>
              <div className="text-gray-600 dark:text-gray-300 space-y-1">
                <p>
                  {order.billing_address.first_name}{" "}
                  {order.billing_address.last_name}
                </p>
                <p>{order.billing_address.address_1}</p>
                {order.billing_address.address_2 && (
                  <p>{order.billing_address.address_2}</p>
                )}
                <p>
                  {order.billing_address.city}, {order.billing_address.province}{" "}
                  {order.billing_address.postal_code}
                </p>
                <p className="uppercase">
                  {order.billing_address.country_code}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
