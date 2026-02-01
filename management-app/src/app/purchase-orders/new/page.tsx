"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

interface Supplier {
  id: string;
  name: string;
}

interface Material {
  id: string;
  name: string;
  sku: string | null;
  unit: string;
  cost_per_unit: number;
}

interface LineItem {
  material_id: string;
  material_name: string;
  material_unit: string;
  quantity_ordered: number;
  unit_price: number;
}

export default function NewPurchaseOrderPage() {
  const { token, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [supplierId, setSupplierId] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([]);

  // Add item form
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [itemQuantity, setItemQuantity] = useState("");
  const [itemPrice, setItemPrice] = useState("");

  useEffect(() => {
    if (!token || authLoading) return;
    Promise.all([fetchSuppliers(), fetchMaterials()]).then(() =>
      setLoading(false),
    );
  }, [token, authLoading]);

  const fetchSuppliers = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/admin/suppliers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSuppliers(data.suppliers || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMaterials = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/admin/raw-materials`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMaterials(data.materials || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddItem = () => {
    if (!selectedMaterial || !itemQuantity) return;

    const material = materials.find((m) => m.id === selectedMaterial);
    if (!material) return;

    const newItem: LineItem = {
      material_id: material.id,
      material_name: material.name,
      material_unit: material.unit,
      quantity_ordered: parseFloat(itemQuantity),
      unit_price: parseFloat(itemPrice) || material.cost_per_unit,
    };

    setLineItems([...lineItems, newItem]);
    setSelectedMaterial("");
    setItemQuantity("");
    setItemPrice("");
  };

  const handleRemoveItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return lineItems.reduce(
      (sum, item) => sum + item.quantity_ordered * item.unit_price,
      0,
    );
  };

  const handleSubmit = async (markOrdered: boolean = false) => {
    if (!supplierId || lineItems.length === 0) {
      alert("Please select a supplier and add at least one item");
      return;
    }

    setSubmitting(true);
    try {
      // Create PO
      const res = await fetch(`${BACKEND_URL}/admin/purchase-orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          supplier_id: supplierId,
          expected_date: expectedDate || undefined,
          notes: notes || undefined,
          items: lineItems.map((item) => ({
            material_id: item.material_id,
            quantity_ordered: item.quantity_ordered,
            unit_price: item.unit_price,
          })),
        }),
      });

      if (!res.ok) throw new Error("Failed to create purchase order");

      const data = await res.json();

      // If marking as ordered, update status
      if (markOrdered) {
        await fetch(
          `${BACKEND_URL}/admin/purchase-orders/${data.purchase_order.id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "ordered" }),
          },
        );
      }

      router.push(`/purchase-orders/${data.purchase_order.id}`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/purchase-orders"
            className="text-amber-600 dark:text-amber-400 hover:underline text-sm mb-2 inline-block"
          >
            ← Back to Purchase Orders
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            New Purchase Order
          </h1>
        </div>

        <div className="space-y-6">
          {/* Supplier & Date */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Order Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Supplier *
                </label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Select supplier...</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Expected Delivery Date
                </label>
                <input
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes..."
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Line Items
            </h2>

            {/* Add Item Form */}
            <div className="grid grid-cols-12 gap-2 mb-4">
              <div className="col-span-5">
                <select
                  value={selectedMaterial}
                  onChange={(e) => {
                    setSelectedMaterial(e.target.value);
                    const mat = materials.find((m) => m.id === e.target.value);
                    if (mat) setItemPrice(mat.cost_per_unit.toString());
                  }}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">Select material...</option>
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.unit})
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(e.target.value)}
                  placeholder="Qty"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
              </div>
              <div className="col-span-3">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                  placeholder="Unit price"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
              </div>
              <div className="col-span-2">
                <button
                  onClick={handleAddItem}
                  disabled={!selectedMaterial || !itemQuantity}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-sm"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Items Table */}
            {lineItems.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No items added yet
              </p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-500 dark:text-gray-400 uppercase">
                    <th className="pb-2">Material</th>
                    <th className="pb-2 text-right">Qty</th>
                    <th className="pb-2 text-right">Unit Price</th>
                    <th className="pb-2 text-right">Total</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {lineItems.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2 text-gray-900 dark:text-white">
                        {item.material_name}
                      </td>
                      <td className="py-2 text-right text-gray-600 dark:text-gray-400">
                        {item.quantity_ordered} {item.material_unit}
                      </td>
                      <td className="py-2 text-right text-gray-600 dark:text-gray-400">
                        ₹{item.unit_price.toLocaleString()}
                      </td>
                      <td className="py-2 text-right text-gray-900 dark:text-white font-medium">
                        ₹
                        {(
                          item.quantity_ordered * item.unit_price
                        ).toLocaleString()}
                      </td>
                      <td className="py-2 text-right">
                        <button
                          onClick={() => handleRemoveItem(idx)}
                          className="text-red-500 hover:text-red-600"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-300 dark:border-gray-600">
                    <td
                      colSpan={3}
                      className="pt-3 text-right font-medium text-gray-900 dark:text-white"
                    >
                      Total:
                    </td>
                    <td className="pt-3 text-right text-lg font-bold text-amber-500">
                      ₹{calculateTotal().toLocaleString()}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Link
              href="/purchase-orders"
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              Cancel
            </Link>
            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting || !supplierId || lineItems.length === 0}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:opacity-50 text-white rounded-lg"
            >
              {submitting ? "Saving..." : "Save as Draft"}
            </button>
            <button
              onClick={() => handleSubmit(true)}
              disabled={submitting || !supplierId || lineItems.length === 0}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-lg"
            >
              {submitting ? "Saving..." : "Save & Mark Ordered"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
