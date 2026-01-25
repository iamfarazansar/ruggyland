"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import {
  WorkOrder,
  STAGE_LABELS,
  STAGE_COLORS,
  PRIORITY_COLORS,
  STATUS_COLORS,
  ManufacturingStage,
  Priority,
  WorkOrderStatus,
} from "@/lib/types";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

export default function WorkOrdersPage() {
  const { token, isAuthenticated } = useAuth();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<{
    stage: ManufacturingStage | "all";
    status: WorkOrderStatus | "all";
    priority: Priority | "all";
  }>({
    stage: "all",
    status: "all",
    priority: "all",
  });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchWorkOrders();
    }
  }, [isAuthenticated, token]);

  const fetchWorkOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/admin/work-orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWorkOrders(data.work_orders || []);
      } else if (response.status === 404) {
        // No work orders yet, that's fine
        setWorkOrders([]);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("API Error:", response.status, errorData);
        throw new Error(errorData.message || `API Error: ${response.status}`);
      }
    } catch (err) {
      console.error("Error fetching work orders:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load work orders",
      );
    } finally {
      setLoading(false);
    }
  };

  const advanceStage = async (workOrderId: string) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/admin/work-orders/${workOrderId}/stages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        },
      );

      if (response.ok) {
        // Refresh the list
        fetchWorkOrders();
      } else {
        const data = await response.json();
        alert(data.message || "Failed to advance stage");
      }
    } catch (err) {
      console.error("Error advancing stage:", err);
      alert("Failed to advance stage");
    }
  };

  const filteredOrders = workOrders.filter((wo) => {
    if (filter.stage !== "all" && wo.current_stage !== filter.stage)
      return false;
    if (filter.status !== "all" && wo.status !== filter.status) return false;
    if (filter.priority !== "all" && wo.priority !== filter.priority)
      return false;
    if (
      searchQuery &&
      !wo.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading work orders...
          </p>
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
            Work Orders
          </h1>
          <p className="text-gray-400 mt-1">Manage production work orders</p>
        </div>
        <a
          href="/orders"
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition flex items-center gap-2"
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
          Create from Order
        </a>
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
              placeholder="Search work orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          {/* Stage Filter */}
          <select
            value={filter.stage}
            onChange={(e) =>
              setFilter({
                ...filter,
                stage: e.target.value as ManufacturingStage | "all",
              })
            }
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Stages</option>
            {Object.entries(STAGE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filter.status}
            onChange={(e) =>
              setFilter({
                ...filter,
                status: e.target.value as WorkOrderStatus | "all",
              })
            }
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filter.priority}
            onChange={(e) =>
              setFilter({
                ...filter,
                priority: e.target.value as Priority | "all",
              })
            }
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>

          {/* Refresh */}
          <button
            onClick={fetchWorkOrders}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-white rounded-lg transition"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-500 mb-4">
        Showing {filteredOrders.length} of {workOrders.length} work orders
      </p>

      {/* Work Orders Table */}
      {workOrders.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
          <p className="text-gray-400 text-lg mb-2">No work orders yet</p>
          <p className="text-gray-500 text-sm mb-6">
            Create work orders from the Orders page
          </p>
          <a
            href="/orders"
            className="inline-block px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition"
          >
            Go to Orders
          </a>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-100 dark:bg-gray-800/50">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Work Order
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Stage
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Priority
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredOrders.map((wo) => (
                <tr
                  key={wo.id}
                  className="hover:bg-gray-100 dark:bg-gray-800/50 transition cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {wo.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {wo.sku || "N/A"} • {wo.size || "N/A"}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium text-white ${STAGE_COLORS[wo.current_stage] || "bg-gray-500"}`}
                    >
                      {STAGE_LABELS[wo.current_stage] || wo.current_stage}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium text-white ${STATUS_COLORS[wo.status] || "bg-gray-500"}`}
                    >
                      {wo.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium text-white ${PRIORITY_COLORS[wo.priority] || "bg-gray-500"}`}
                    >
                      {wo.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-300">
                      {wo.due_date
                        ? new Date(wo.due_date).toLocaleDateString()
                        : "-"}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/work-orders/${wo.id}`}
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
                      {wo.current_stage !== "ready_to_ship" &&
                        wo.status !== "completed" && (
                          <button
                            onClick={() => advanceStage(wo.id)}
                            className="p-2 hover:bg-gray-700 rounded-lg transition"
                            title="Advance Stage"
                          >
                            <svg
                              className="w-4 h-4 text-green-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 7l5 5m0 0l-5 5m5-5H6"
                              />
                            </svg>
                          </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
