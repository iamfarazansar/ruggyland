"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

interface PurchaseOrder {
  id: string;
  supplier_id: string;
  supplier_name: string;
  status: string;
  order_date: string | null;
  expected_date: string | null;
  received_date: string | null;
  subtotal: number;
  notes: string | null;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-500/20 text-gray-400",
  ordered: "bg-blue-500/20 text-blue-400",
  partial: "bg-yellow-500/20 text-yellow-400",
  received: "bg-green-500/20 text-green-400",
  cancelled: "bg-red-500/20 text-red-400",
};

export default function PurchaseOrdersPage() {
  const { token, isLoading: authLoading } = useAuth();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    if (!token || authLoading) return;
    fetchPurchaseOrders();
  }, [token, authLoading]);

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      const url = statusFilter
        ? `${BACKEND_URL}/admin/purchase-orders?status=${statusFilter}`
        : `${BACKEND_URL}/admin/purchase-orders`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch purchase orders");
      const data = await res.json();
      setPurchaseOrders(data.purchase_orders || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || authLoading) return;
    fetchPurchaseOrders();
  }, [statusFilter]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <Link
              href="/inventory"
              className="text-amber-600 dark:text-amber-400 hover:underline text-sm mb-2 inline-block"
            >
              ← Back to Inventory
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              📋 Purchase Orders
            </h1>
          </div>
          <Link
            href="/purchase-orders/new"
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
          >
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
            New Purchase Order
          </Link>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 mb-6">
          {["", "draft", "ordered", "partial", "received", "cancelled"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  statusFilter === status
                    ? "bg-amber-500 text-white"
                    : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {status === ""
                  ? "All"
                  : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ),
          )}
        </div>

        {/* Purchase Orders List */}
        {purchaseOrders.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-12 text-center text-gray-500 dark:text-gray-400">
            <p className="text-4xl mb-4">📋</p>
            <p>No purchase orders found</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    PO #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Order Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Expected
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {purchaseOrders.map((po) => (
                  <tr
                    key={po.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/purchase-orders/${po.id}`}
                        className="text-amber-600 dark:text-amber-400 hover:underline font-medium"
                      >
                        {po.id.slice(0, 8)}...
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                      {po.supplier_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[po.status] || STATUS_COLORS.draft}`}
                      >
                        {po.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                      {formatDate(po.order_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                      {formatDate(po.expected_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900 dark:text-white font-medium">
                      ₹{po.subtotal.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link
                        href={`/purchase-orders/${po.id}`}
                        className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
