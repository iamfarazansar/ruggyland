"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  STAGE_LABELS,
  STAGE_COLORS,
  ManufacturingStage,
  WorkOrder,
} from "@/lib/types";

// Visible stages for the Kanban board
const KANBAN_STAGES: ManufacturingStage[] = [
  "design_approved",
  "yarn_planning",
  "tufting",
  "trimming",
  "washing",
  "drying",
  "finishing",
  "qc",
  "packing",
  "ready_to_ship",
];

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

const PRIORITY_BORDER_COLORS: Record<string, string> = {
  low: "border-l-gray-500",
  normal: "border-l-blue-500",
  high: "border-l-orange-500",
  urgent: "border-l-red-500",
};

export default function KanbanPage() {
  const { token, isAuthenticated } = useAuth();
  const [workOrders, setWorkOrders] = useState<Partial<WorkOrder>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      } else {
        throw new Error("Failed to fetch work orders");
      }
    } catch (err) {
      console.error("Error fetching work orders:", err);
      setError("Failed to load work orders");
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
        fetchWorkOrders();
      } else {
        const data = await response.json();
        alert(data.message || "Failed to advance stage");
      }
    } catch (err) {
      console.error("Error advancing stage:", err);
    }
  };

  const getOrdersByStage = (stage: ManufacturingStage) => {
    return workOrders.filter((wo) => wo.current_stage === stage);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading production board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Production Board</h1>
          <p className="text-gray-400 mt-1">
            Visual workflow for all work orders
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchWorkOrders}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition"
          >
            ↻ Refresh
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="w-3 h-3 rounded-full bg-gray-500"></span> Low
            <span className="w-3 h-3 rounded-full bg-blue-500 ml-2"></span>{" "}
            Normal
            <span className="w-3 h-3 rounded-full bg-orange-500 ml-2"></span>{" "}
            High
            <span className="w-3 h-3 rounded-full bg-red-500 ml-2"></span>{" "}
            Urgent
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {workOrders.length === 0 ? (
        <div className="flex-1 flex items-center justify-center bg-gray-900/50 rounded-xl border border-gray-800">
          <div className="text-center">
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
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-4 h-full min-w-max pb-4">
            {KANBAN_STAGES.map((stage) => {
              const orders = getOrdersByStage(stage);
              return (
                <div
                  key={stage}
                  className="w-72 flex-shrink-0 bg-gray-900/50 rounded-xl border border-gray-800 flex flex-col"
                >
                  {/* Column Header */}
                  <div className="p-4 border-b border-gray-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-3 h-3 rounded-full ${STAGE_COLORS[stage]}`}
                        ></span>
                        <h3 className="font-medium text-white text-sm">
                          {STAGE_LABELS[stage]}
                        </h3>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">
                        {orders.length}
                      </span>
                    </div>
                  </div>

                  {/* Cards Container */}
                  <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)]">
                    {orders.map((wo) => (
                      <KanbanCard
                        key={wo.id}
                        workOrder={wo}
                        onAdvance={() => advanceStage(wo.id!)}
                        isLastStage={stage === "ready_to_ship"}
                      />
                    ))}

                    {orders.length === 0 && (
                      <div className="text-center py-8 text-gray-600 text-sm">
                        No work orders
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function KanbanCard({
  workOrder,
  onAdvance,
  isLastStage,
}: {
  workOrder: Partial<WorkOrder>;
  onAdvance: () => void;
  isLastStage: boolean;
}) {
  const priorityBorder = PRIORITY_BORDER_COLORS[workOrder.priority || "normal"];

  return (
    <div
      className={`bg-gray-800 rounded-lg p-3 border-l-4 ${priorityBorder} hover:bg-gray-750 transition cursor-pointer group`}
    >
      <div className="flex items-start justify-between">
        <h4 className="text-sm font-medium text-white leading-tight">
          {workOrder.title}
        </h4>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {workOrder.due_date
            ? `Due: ${new Date(workOrder.due_date).toLocaleDateString()}`
            : "No due date"}
        </span>
        {workOrder.priority === "urgent" && (
          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
            Urgent
          </span>
        )}
        {workOrder.priority === "high" && (
          <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">
            High
          </span>
        )}
      </div>

      {/* Quick Actions */}
      {!isLastStage && workOrder.status !== "completed" && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <button
            onClick={onAdvance}
            className="w-full py-1.5 text-xs bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded transition"
          >
            → Next Stage
          </button>
        </div>
      )}
    </div>
  );
}
