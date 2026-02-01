"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import {
  Material,
  Supplier,
  MaterialCategory,
  MaterialUnit,
  MATERIAL_CATEGORY_LABELS,
  MATERIAL_CATEGORY_COLORS,
  MATERIAL_UNIT_LABELS,
} from "@/lib/types";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

const CATEGORIES: MaterialCategory[] = [
  "yarn",
  "backing",
  "supplies",
  "tools",
  "chemicals",
];
const UNITS: MaterialUnit[] = ["kg", "meters", "pieces", "liters", "rolls"];

export default function MaterialsPage() {
  const { token, isLoading: authLoading } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustingMaterial, setAdjustingMaterial] = useState<Material | null>(
    null,
  );

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    category: "yarn" as MaterialCategory,
    unit: "kg" as MaterialUnit,
    current_stock: 0,
    min_stock_level: 0,
    cost_per_unit: 0,
    color: "",
    weight_type: "",
    supplier_id: "",
  });

  // Adjust stock form
  const [adjustData, setAdjustData] = useState({
    quantity: 0,
    type: "in" as "in" | "out" | "adjust",
    reason: "",
    notes: "",
  });

  useEffect(() => {
    if (!token || authLoading) return;
    fetchData();
  }, [token, authLoading]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [materialsRes, suppliersRes] = await Promise.all([
        fetch(`${BACKEND_URL}/admin/raw-materials`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${BACKEND_URL}/admin/suppliers`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!materialsRes.ok) throw new Error("Failed to fetch materials");
      const materialsData = await materialsRes.json();
      setMaterials(materialsData.materials || []);

      if (suppliersRes.ok) {
        const suppliersData = await suppliersRes.json();
        setSuppliers(suppliersData.suppliers || []);
      }

      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingMaterial
        ? `${BACKEND_URL}/admin/raw-materials/${editingMaterial.id}`
        : `${BACKEND_URL}/admin/raw-materials`;
      const method = editingMaterial ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          supplier_id: formData.supplier_id || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to save material");

      setShowModal(false);
      setEditingMaterial(null);
      resetForm();
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingMaterial) return;

    try {
      const res = await fetch(
        `${BACKEND_URL}/admin/raw-materials/${adjustingMaterial.id}/adjust`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(adjustData),
        },
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to adjust stock");
      }

      setShowAdjustModal(false);
      setAdjustingMaterial(null);
      setAdjustData({ quantity: 0, type: "in", reason: "", notes: "" });
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this material?")) return;

    try {
      const res = await fetch(`${BACKEND_URL}/admin/raw-materials/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete material");
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      sku: "",
      description: "",
      category: "yarn",
      unit: "kg",
      current_stock: 0,
      min_stock_level: 0,
      cost_per_unit: 0,
      color: "",
      weight_type: "",
      supplier_id: "",
    });
  };

  const openEdit = (m: Material) => {
    setEditingMaterial(m);
    setFormData({
      name: m.name,
      sku: m.sku || "",
      description: m.description || "",
      category: m.category,
      unit: m.unit,
      current_stock: m.current_stock,
      min_stock_level: m.min_stock_level,
      cost_per_unit: m.cost_per_unit,
      color: m.color || "",
      weight_type: m.weight_type || "",
      supplier_id: m.supplier_id || "",
    });
    setShowModal(true);
  };

  const filteredMaterials =
    categoryFilter === "all"
      ? materials
      : materials.filter((m) => m.category === categoryFilter);

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
              📋 Materials
            </h1>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingMaterial(null);
              setShowModal(true);
            }}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition"
          >
            ➕ Add Material
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setCategoryFilter("all")}
              className={`px-3 py-1 rounded-full text-sm ${
                categoryFilter === "all"
                  ? "bg-amber-500 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              All ({materials.length})
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-full text-sm ${
                  categoryFilter === cat
                    ? MATERIAL_CATEGORY_COLORS[cat] + " text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {MATERIAL_CATEGORY_LABELS[cat]} (
                {materials.filter((m) => m.category === cat).length})
              </button>
            ))}
          </div>
        </div>

        {/* Materials Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          {filteredMaterials.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p className="text-4xl mb-4">📦</p>
              <p>No materials found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                    Material
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                    Category
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                    Stock
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMaterials.map((m) => (
                  <tr
                    key={m.id}
                    className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {m.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {m.sku || "No SKU"} {m.color && `• ${m.color}`}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs text-white ${MATERIAL_CATEGORY_COLORS[m.category]}`}
                      >
                        {MATERIAL_CATEGORY_LABELS[m.category]}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {m.current_stock} {m.unit}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Min: {m.min_stock_level}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      {m.current_stock <= m.min_stock_level ? (
                        <span className="text-red-600 dark:text-red-400 font-medium">
                          ⚠️ Low Stock
                        </span>
                      ) : (
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          ✓ In Stock
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setAdjustingMaterial(m);
                            setShowAdjustModal(true);
                          }}
                          className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm"
                        >
                          📊 Adjust
                        </button>
                        <button
                          onClick={() => openEdit(m)}
                          className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 text-sm"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {editingMaterial ? "Edit Material" : "Add Material"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      SKU
                    </label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) =>
                        setFormData({ ...formData, sku: e.target.value })
                      }
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category: e.target.value as MaterialCategory,
                        })
                      }
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      required
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {MATERIAL_CATEGORY_LABELS[c]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Unit *
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          unit: e.target.value as MaterialUnit,
                        })
                      }
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      required
                    >
                      {UNITS.map((u) => (
                        <option key={u} value={u}>
                          {MATERIAL_UNIT_LABELS[u]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Current Stock
                    </label>
                    <input
                      type="number"
                      value={formData.current_stock}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          current_stock: Number(e.target.value),
                        })
                      }
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Min Stock Level
                    </label>
                    <input
                      type="number"
                      value={formData.min_stock_level}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          min_stock_level: Number(e.target.value),
                        })
                      }
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cost per Unit
                    </label>
                    <input
                      type="number"
                      value={formData.cost_per_unit}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cost_per_unit: Number(e.target.value),
                        })
                      }
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  {formData.category === "yarn" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Color
                        </label>
                        <input
                          type="text"
                          value={formData.color}
                          onChange={(e) =>
                            setFormData({ ...formData, color: e.target.value })
                          }
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Weight Type
                        </label>
                        <select
                          value={formData.weight_type}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              weight_type: e.target.value,
                            })
                          }
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                          <option value="">Select...</option>
                          <option value="fine">Fine</option>
                          <option value="medium">Medium</option>
                          <option value="bulky">Bulky</option>
                        </select>
                      </div>
                    </>
                  )}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Supplier
                    </label>
                    <select
                      value={formData.supplier_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          supplier_id: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="">No supplier</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      rows={2}
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg"
                  >
                    {editingMaterial ? "Save Changes" : "Add Material"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Adjust Stock Modal */}
        {showAdjustModal && adjustingMaterial && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                📊 Adjust Stock: {adjustingMaterial.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Current stock:{" "}
                <strong className="text-gray-900 dark:text-white">
                  {adjustingMaterial.current_stock} {adjustingMaterial.unit}
                </strong>
              </p>
              <form onSubmit={handleAdjustStock} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type
                  </label>
                  <select
                    value={adjustData.type}
                    onChange={(e) =>
                      setAdjustData({
                        ...adjustData,
                        type: e.target.value as any,
                      })
                    }
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="in">➕ Stock In (Add)</option>
                    <option value="out">➖ Stock Out (Consume)</option>
                    <option value="adjust">🔄 Set Exact Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {adjustData.type === "adjust"
                      ? "New Stock Amount"
                      : "Quantity"}
                  </label>
                  <input
                    type="number"
                    value={adjustData.quantity}
                    onChange={(e) =>
                      setAdjustData({
                        ...adjustData,
                        quantity: Number(e.target.value),
                      })
                    }
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Reason
                  </label>
                  <select
                    value={adjustData.reason}
                    onChange={(e) =>
                      setAdjustData({ ...adjustData, reason: e.target.value })
                    }
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">Select reason...</option>
                    <option value="purchase">Purchase</option>
                    <option value="production">Production Use</option>
                    <option value="damaged">Damaged/Wasted</option>
                    <option value="returned">Returned</option>
                    <option value="inventory_count">Inventory Count</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={adjustData.notes}
                    onChange={(e) =>
                      setAdjustData({ ...adjustData, notes: e.target.value })
                    }
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    rows={2}
                  />
                </div>
                <div className="flex gap-2 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAdjustModal(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                  >
                    Adjust Stock
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
