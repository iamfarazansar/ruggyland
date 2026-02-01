"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import {
  Material,
  MaterialCategory,
  MATERIAL_CATEGORY_LABELS,
  MATERIAL_CATEGORY_COLORS,
} from "@/lib/types";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

interface InventoryStats {
  total: number;
  lowStock: number;
  byCategory: Record<MaterialCategory, number>;
}

export default function InventoryDashboard() {
  const { token, isLoading: authLoading } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [lowStockMaterials, setLowStockMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || authLoading) return;
    fetchData();
  }, [token, authLoading]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch all materials
      const materialsRes = await fetch(`${BACKEND_URL}/admin/raw-materials`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!materialsRes.ok) throw new Error("Failed to fetch materials");
      const materialsData = await materialsRes.json();
      setMaterials(materialsData.materials || []);

      // Fetch low stock materials
      const lowStockRes = await fetch(
        `${BACKEND_URL}/admin/raw-materials/low-stock`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (lowStockRes.ok) {
        const lowStockData = await lowStockRes.json();
        setLowStockMaterials(lowStockData.materials || []);
      }

      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStats = (): InventoryStats => {
    const byCategory = materials.reduce(
      (acc, m) => {
        acc[m.category] = (acc[m.category] || 0) + 1;
        return acc;
      },
      {} as Record<MaterialCategory, number>,
    );

    return {
      total: materials.length,
      lowStock: lowStockMaterials.length,
      byCategory,
    };
  };

  const stats = getStats();

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              📦 Inventory Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage raw materials and stock levels
            </p>
          </div>
          <Link
            href="/inventory/materials"
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
          >
            <span>➕</span> Add Material
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Materials"
            value={stats.total}
            icon="📦"
            color="bg-blue-500"
          />
          <StatsCard
            title="Low Stock Alerts"
            value={stats.lowStock}
            icon="⚠️"
            color={stats.lowStock > 0 ? "bg-red-500" : "bg-green-500"}
          />
          <StatsCard
            title="Yarn Types"
            value={stats.byCategory.yarn || 0}
            icon="🧶"
            color="bg-purple-500"
          />
          <StatsCard
            title="Backing Materials"
            value={stats.byCategory.backing || 0}
            icon="🏷️"
            color="bg-orange-500"
          />
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <QuickLink
            href="/inventory/materials"
            title="Materials"
            description="Manage raw materials inventory"
            icon="📋"
          />
          <QuickLink
            href="/inventory/suppliers"
            title="Suppliers"
            description="Manage material suppliers"
            icon="🏭"
          />
          <QuickLink
            href="/inventory/movements"
            title="Stock Movements"
            description="View stock movement history"
            icon="📊"
          />
        </div>

        {/* Low Stock Alerts */}
        {lowStockMaterials.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-400 mb-4 flex items-center gap-2">
              ⚠️ Low Stock Alerts ({lowStockMaterials.length})
            </h2>
            <div className="grid gap-3">
              {lowStockMaterials.map((m) => (
                <div
                  key={m.id}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 flex justify-between items-center shadow-sm"
                >
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {m.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {MATERIAL_CATEGORY_LABELS[m.category]} • SKU:{" "}
                      {m.sku || "N/A"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-600 dark:text-red-400 font-bold">
                      {m.current_stock} {m.unit}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Min: {m.min_stock_level} {m.unit}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Materials */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Materials Overview
            </h2>
            <Link
              href="/inventory/materials"
              className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 text-sm font-medium"
            >
              View All →
            </Link>
          </div>

          {materials.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p className="text-4xl mb-4">📦</p>
              <p>No materials added yet.</p>
              <Link
                href="/inventory/materials"
                className="text-amber-600 dark:text-amber-400 hover:underline mt-2 inline-block"
              >
                Add your first material
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                      Name
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
                  </tr>
                </thead>
                <tbody>
                  {materials.slice(0, 10).map((material) => (
                    <tr
                      key={material.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {material.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {material.sku || "No SKU"}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs text-white ${MATERIAL_CATEGORY_COLORS[material.category]}`}
                        >
                          {MATERIAL_CATEGORY_LABELS[material.category]}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                        {material.current_stock} {material.unit}
                      </td>
                      <td className="py-3 px-4">
                        {material.current_stock <= material.min_stock_level ? (
                          <span className="text-red-600 dark:text-red-400 font-medium">
                            ⚠️ Low
                          </span>
                        ) : (
                          <span className="text-green-600 dark:text-green-400 font-medium">
                            ✓ OK
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: string;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-2xl`}
        >
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function QuickLink({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md dark:hover:bg-gray-800 transition group"
    >
      <div className="flex items-center gap-4">
        <span className="text-3xl">{icon}</span>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400">
            {title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}
