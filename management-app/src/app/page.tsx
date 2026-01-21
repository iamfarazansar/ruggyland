"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { STAGE_LABELS, STAGE_COLORS, ManufacturingStage } from "@/lib/types";

interface DashboardStats {
  newOrders: number;
  inTufting: number;
  qcPending: number;
  readyToShip: number;
  totalActive: number;
}

interface WorkOrderSummary {
  id: string;
  title: string;
  current_stage: ManufacturingStage;
  priority: string;
  due_date: string | null;
}

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

export default function Dashboard() {
  const { token, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    newOrders: 0,
    inTufting: 0,
    qcPending: 0,
    readyToShip: 0,
    totalActive: 0,
  });
  const [recentWorkOrders, setRecentWorkOrders] = useState<WorkOrderSummary[]>(
    [],
  );
  const [stageCounts, setStageCounts] = useState<
    Record<ManufacturingStage, number>
  >({} as Record<ManufacturingStage, number>);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchDashboardData();
    }
  }, [isAuthenticated, token]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch work orders
      const workOrdersRes = await fetch(`${BACKEND_URL}/admin/work-orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (workOrdersRes.ok) {
        const data = await workOrdersRes.json();
        const workOrders = data.work_orders || [];

        // Calculate stats
        const inProgress = workOrders.filter(
          (wo: any) => wo.status === "in_progress",
        );
        const pending = workOrders.filter((wo: any) => wo.status === "pending");

        // Count by stage
        const counts: Record<string, number> = {};
        workOrders.forEach((wo: any) => {
          counts[wo.current_stage] = (counts[wo.current_stage] || 0) + 1;
        });

        setStats({
          newOrders: pending.length,
          inTufting: counts["tufting"] || 0,
          qcPending: counts["qc"] || 0,
          readyToShip: counts["ready_to_ship"] || 0,
          totalActive: inProgress.length,
        });

        setStageCounts(counts as Record<ManufacturingStage, number>);

        // Get priority work orders (high/urgent, not completed)
        const priorityOrders = workOrders
          .filter(
            (wo: any) =>
              (wo.priority === "high" || wo.priority === "urgent") &&
              wo.status !== "completed",
          )
          .slice(0, 5)
          .map((wo: any) => ({
            id: wo.id,
            title: wo.title,
            current_stage: wo.current_stage,
            priority: wo.priority,
            due_date: wo.due_date,
          }));

        setRecentWorkOrders(priorityOrders);
      } else {
        // If work orders endpoint fails (no data yet), show zeros
        console.log("No work orders data yet");
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">
          Manufacturing overview and quick actions
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400 text-sm">
          {error} - Showing placeholder data
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Pending Orders"
          value={stats.newOrders}
          icon="📦"
          color="from-blue-500 to-blue-600"
          subtitle="Awaiting start"
        />
        <KPICard
          title="In Tufting"
          value={stats.inTufting}
          icon="🧵"
          color="from-orange-500 to-orange-600"
          subtitle="Active production"
        />
        <KPICard
          title="QC Pending"
          value={stats.qcPending}
          icon="✅"
          color="from-red-500 to-red-600"
          subtitle="Ready for review"
        />
        <KPICard
          title="Ready to Ship"
          value={stats.readyToShip}
          icon="🚚"
          color="from-green-500 to-green-600"
          subtitle="Completed"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Work Orders */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">
              Priority Work Orders
            </h2>
            <a
              href="/work-orders"
              className="text-sm text-amber-500 hover:text-amber-400"
            >
              View all →
            </a>
          </div>
          <div className="space-y-3">
            {recentWorkOrders.length > 0 ? (
              recentWorkOrders.map((wo) => (
                <div
                  key={wo.id}
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`w-2 h-2 rounded-full ${STAGE_COLORS[wo.current_stage] || "bg-gray-500"}`}
                    ></span>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {wo.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {STAGE_LABELS[wo.current_stage] || wo.current_stage}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-xs font-medium ${wo.priority === "urgent" ? "text-red-400" : wo.priority === "high" ? "text-orange-400" : "text-gray-400"}`}
                    >
                      {wo.priority?.toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {wo.due_date
                        ? `Due: ${new Date(wo.due_date).toLocaleDateString()}`
                        : "No due date"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No priority work orders</p>
                <p className="text-xs mt-1">
                  Create work orders from the Orders page
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Stage Overview */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Stage Overview</h2>
            <a
              href="/kanban"
              className="text-sm text-amber-500 hover:text-amber-400"
            >
              Kanban Board →
            </a>
          </div>
          <div className="space-y-3">
            {(
              [
                "tufting",
                "trimming",
                "washing",
                "finishing",
                "qc",
                "packing",
              ] as ManufacturingStage[]
            ).map((stage) => {
              const count = stageCounts[stage] || 0;
              const maxCount = Math.max(...Object.values(stageCounts), 1);
              const percentage = (count / maxCount) * 100;

              return (
                <div key={stage} className="flex items-center gap-4">
                  <div
                    className={`w-3 h-3 rounded-full ${STAGE_COLORS[stage]}`}
                  ></div>
                  <span className="text-sm text-gray-300 flex-1">
                    {STAGE_LABELS[stage]}
                  </span>
                  <div className="w-32 bg-gray-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${STAGE_COLORS[stage]} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500 w-8 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 p-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl border border-amber-500/20">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <a
            href="/orders"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition"
          >
            View Orders
          </a>
          <a
            href="/work-orders"
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition"
          >
            Work Orders
          </a>
          <a
            href="/kanban"
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition"
          >
            Kanban Board
          </a>
          <a
            href="/artisans"
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition"
          >
            Artisans
          </a>
        </div>
      </div>
    </div>
  );
}

function KPICard({
  title,
  value,
  icon,
  color,
  subtitle,
}: {
  title: string;
  value: number;
  icon: string;
  color: string;
  subtitle: string;
}) {
  return (
    <div className="relative overflow-hidden bg-gray-900 rounded-2xl border border-gray-800 p-6">
      <div
        className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${color} opacity-10 rounded-full -translate-y-8 translate-x-8`}
      ></div>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}
