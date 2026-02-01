"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { StockMovement, Material } from "@/lib/types";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

export default function StockMovementsPage() {
  const { token, isLoading: authLoading } = useAuth();
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    if (!token || authLoading) return;
    fetchData();
  }, [token, authLoading]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [movementsRes, materialsRes] = await Promise.all([
        fetch(`${BACKEND_URL}/admin/stock-movements?limit=100`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${BACKEND_URL}/admin/raw-materials`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!movementsRes.ok) throw new Error("Failed to fetch movements");
      const movementsData = await movementsRes.json();
      setMovements(movementsData.movements || []);

      if (materialsRes.ok) {
        const materialsData = await materialsRes.json();
        setMaterials(materialsData.materials || []);
      }

      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getMaterialName = (id: string) => {
    const material = materials.find((m) => m.id === id);
    return material?.name || "Unknown Material";
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "in":
        return "➕";
      case "out":
        return "➖";
      case "adjust":
        return "🔄";
      default:
        return "📦";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "in":
        return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30";
      case "out":
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30";
      case "adjust":
        return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800";
    }
  };

  const filteredMovements =
    typeFilter === "all"
      ? movements
      : movements.filter((m) => m.type === typeFilter);

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
              📊 Stock Movements
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              History of all inventory changes
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setTypeFilter("all")}
              className={`px-3 py-1 rounded-full text-sm ${
                typeFilter === "all"
                  ? "bg-amber-500 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              All ({movements.length})
            </button>
            <button
              onClick={() => setTypeFilter("in")}
              className={`px-3 py-1 rounded-full text-sm ${
                typeFilter === "in"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              ➕ Stock In ({movements.filter((m) => m.type === "in").length})
            </button>
            <button
              onClick={() => setTypeFilter("out")}
              className={`px-3 py-1 rounded-full text-sm ${
                typeFilter === "out"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              ➖ Stock Out ({movements.filter((m) => m.type === "out").length})
            </button>
            <button
              onClick={() => setTypeFilter("adjust")}
              className={`px-3 py-1 rounded-full text-sm ${
                typeFilter === "adjust"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              🔄 Adjustments (
              {movements.filter((m) => m.type === "adjust").length})
            </button>
          </div>
        </div>

        {/* Movements List */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          {filteredMovements.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p className="text-4xl mb-4">📊</p>
              <p>No stock movements recorded yet</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                    Material
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                    Quantity
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                    Stock Change
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                    Reason
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMovements.map((m) => (
                  <tr
                    key={m.id}
                    className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(m.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                      {getMaterialName(m.material_id)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(m.type)}`}
                      >
                        {getTypeIcon(m.type)} {m.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={
                          m.type === "out"
                            ? "text-red-600 dark:text-red-400"
                            : "text-green-600 dark:text-green-400"
                        }
                      >
                        {m.type === "out" ? "-" : "+"}
                        {Math.abs(m.quantity)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {m.stock_before} → {m.stock_after}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {m.reason || "-"}
                        </p>
                        {m.notes && (
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {m.notes}
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
