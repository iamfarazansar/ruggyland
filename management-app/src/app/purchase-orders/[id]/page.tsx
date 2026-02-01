"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

interface PurchaseOrderItem {
  id: string;
  material_id: string;
  material_name: string;
  material_sku?: string;
  material_unit?: string;
  quantity_ordered: number;
  quantity_received: number;
  unit_price: number;
}

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
  items: PurchaseOrderItem[];
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-500/20 text-gray-400",
  ordered: "bg-blue-500/20 text-blue-400",
  partial: "bg-yellow-500/20 text-yellow-400",
  received: "bg-green-500/20 text-green-400",
  cancelled: "bg-red-500/20 text-red-400",
};

export default function PurchaseOrderDetailPage() {
  const { token, isLoading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();

  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [receiving, setReceiving] = useState(false);
  const [updating, setUpdating] = useState(false);

  const poId = params.id as string;

  useEffect(() => {
    if (!token || authLoading || !poId) return;
    fetchPurchaseOrder();
  }, [token, authLoading, poId]);

  const fetchPurchaseOrder = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/admin/purchase-orders/${poId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch purchase order");
      const data = await res.json();
      setPurchaseOrder(data.purchase_order);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`${BACKEND_URL}/admin/purchase-orders/${poId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      fetchPurchaseOrder();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleReceiveAll = async () => {
    if (
      !confirm("Mark all items as received? This will add stock to inventory.")
    )
      return;

    setReceiving(true);
    try {
      const res = await fetch(
        `${BACKEND_URL}/admin/purchase-orders/${poId}/receive`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}), // Receive all remaining
        },
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to receive");
      }
      fetchPurchaseOrder();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setReceiving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this purchase order?")) return;

    try {
      const res = await fetch(`${BACKEND_URL}/admin/purchase-orders/${poId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }
      router.push("/purchase-orders");
    } catch (err: any) {
      alert(err.message);
    }
  };

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

  if (!purchaseOrder) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">
          Purchase order not found
        </p>
      </div>
    );
  }

  const canReceive =
    purchaseOrder.status === "ordered" || purchaseOrder.status === "partial";
  const canDelete = purchaseOrder.status === "draft";
  const canMarkOrdered = purchaseOrder.status === "draft";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <Link
              href="/purchase-orders"
              className="text-amber-600 dark:text-amber-400 hover:underline text-sm mb-2 inline-block"
            >
              ← Back to Purchase Orders
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Purchase Order
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {purchaseOrder.id}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[purchaseOrder.status]}`}
          >
            {purchaseOrder.status}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Line Items
              </h2>
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-500 dark:text-gray-400 uppercase">
                    <th className="pb-2">Material</th>
                    <th className="pb-2 text-right">Ordered</th>
                    <th className="pb-2 text-right">Received</th>
                    <th className="pb-2 text-right">Unit Price</th>
                    <th className="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {purchaseOrder.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3">
                        <span className="text-gray-900 dark:text-white">
                          {item.material_name}
                        </span>
                        {item.material_sku && (
                          <span className="text-gray-500 text-sm ml-2">
                            ({item.material_sku})
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right text-gray-600 dark:text-gray-400">
                        {item.quantity_ordered} {item.material_unit || ""}
                      </td>
                      <td className="py-3 text-right">
                        <span
                          className={
                            item.quantity_received >= item.quantity_ordered
                              ? "text-green-500"
                              : item.quantity_received > 0
                                ? "text-yellow-500"
                                : "text-gray-500"
                          }
                        >
                          {item.quantity_received}
                        </span>
                      </td>
                      <td className="py-3 text-right text-gray-600 dark:text-gray-400">
                        ₹{item.unit_price.toLocaleString()}
                      </td>
                      <td className="py-3 text-right text-gray-900 dark:text-white font-medium">
                        ₹
                        {(
                          item.quantity_ordered * item.unit_price
                        ).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-300 dark:border-gray-600">
                    <td
                      colSpan={4}
                      className="pt-3 text-right font-medium text-gray-900 dark:text-white"
                    >
                      Total:
                    </td>
                    <td className="pt-3 text-right text-lg font-bold text-amber-500">
                      ₹{purchaseOrder.subtotal.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Notes */}
            {purchaseOrder.notes && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Notes
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {purchaseOrder.notes}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Details */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Details
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Supplier
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {purchaseOrder.supplier_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Created
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {formatDate(purchaseOrder.created_at)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Order Date
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {formatDate(purchaseOrder.order_date)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Expected
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {formatDate(purchaseOrder.expected_date)}
                  </span>
                </div>
                {purchaseOrder.received_date && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      Received
                    </span>
                    <span className="text-green-500">
                      {formatDate(purchaseOrder.received_date)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Actions
              </h2>
              <div className="space-y-3">
                {canMarkOrdered && (
                  <button
                    onClick={() => handleUpdateStatus("ordered")}
                    disabled={updating}
                    className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white py-2 rounded-lg"
                  >
                    {updating ? "Updating..." : "Mark as Ordered"}
                  </button>
                )}

                {canReceive && (
                  <button
                    onClick={handleReceiveAll}
                    disabled={receiving}
                    className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white py-2 rounded-lg"
                  >
                    {receiving ? "Receiving..." : "Receive All Items"}
                  </button>
                )}

                {purchaseOrder.status !== "cancelled" &&
                  purchaseOrder.status !== "received" && (
                    <button
                      onClick={() => handleUpdateStatus("cancelled")}
                      disabled={updating}
                      className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-500 py-2 rounded-lg"
                    >
                      Cancel Order
                    </button>
                  )}

                {canDelete && (
                  <button
                    onClick={handleDelete}
                    className="w-full text-red-500 hover:bg-red-500/10 py-2 rounded-lg"
                  >
                    Delete Draft
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
