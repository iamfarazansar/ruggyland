"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import {
  WorkOrder,
  STAGE_LABELS,
  STAGE_COLORS,
  PRIORITY_COLORS,
  STATUS_COLORS,
  ManufacturingStage,
} from "@/lib/types";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

const ALL_STAGES: ManufacturingStage[] = [
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

interface ConsumedMaterial {
  id: string;
  material_id: string;
  material_name: string;
  material_sku?: string;
  material_unit?: string;
  quantity: number;
  cost_per_unit: number;
  total_cost: number;
  notes?: string;
  created_at: string;
}

interface MaterialOption {
  id: string;
  name: string;
  sku?: string;
  unit: string;
  current_stock: number;
  cost_per_unit: number;
}

export default function WorkOrderDetailPage() {
  const params = useParams();
  const { token, isAuthenticated } = useAuth();
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [advancing, setAdvancing] = useState(false);

  // Material consumption state
  const [consumedMaterials, setConsumedMaterials] = useState<
    ConsumedMaterial[]
  >([]);
  const [totalMaterialCost, setTotalMaterialCost] = useState(0);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [availableMaterials, setAvailableMaterials] = useState<
    MaterialOption[]
  >([]);
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [materialQuantity, setMaterialQuantity] = useState("");
  const [materialNotes, setMaterialNotes] = useState("");
  const [addingMaterial, setAddingMaterial] = useState(false);

  // Artisan assignment state
  interface ArtisanAssignment {
    id: string;
    artisan_id: string;
    artisan_name: string;
    role?: string;
    labor_cost: number;
    notes?: string;
    status: string;
  }

  interface ArtisanOption {
    id: string;
    name: string;
    role?: string;
  }

  const [assignedArtisans, setAssignedArtisans] = useState<ArtisanAssignment[]>(
    [],
  );
  const [totalLaborCost, setTotalLaborCost] = useState(0);
  const [showArtisanModal, setShowArtisanModal] = useState(false);
  const [availableArtisans, setAvailableArtisans] = useState<ArtisanOption[]>(
    [],
  );
  const [selectedArtisan, setSelectedArtisan] = useState("");
  const [artisanRole, setArtisanRole] = useState("");
  const [artisanCost, setArtisanCost] = useState("");
  const [artisanNotes, setArtisanNotes] = useState("");
  const [addingArtisan, setAddingArtisan] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);

  const workOrderId = params.id as string;

  useEffect(() => {
    if (isAuthenticated && token && workOrderId) {
      fetchWorkOrder();
      fetchConsumedMaterials();
      fetchAssignedArtisans();
    }
  }, [isAuthenticated, token, workOrderId]);

  const fetchWorkOrder = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${BACKEND_URL}/admin/work-orders/${workOrderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setWorkOrder(data.work_order);
      } else {
        throw new Error("Failed to fetch work order");
      }
    } catch (err) {
      console.error("Error fetching work order:", err);
      setError("Failed to load work order details");
    } finally {
      setLoading(false);
    }
  };

  const fetchConsumedMaterials = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/admin/work-orders/${workOrderId}/materials`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setConsumedMaterials(data.materials || []);
        setTotalMaterialCost(data.total_cost || 0);
      }
    } catch (err) {
      console.error("Error fetching consumed materials:", err);
    }
  };

  const fetchAvailableMaterials = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/admin/raw-materials`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableMaterials(data.materials || []);
      }
    } catch (err) {
      console.error("Error fetching materials:", err);
    }
  };

  // Artisan functions
  const fetchAssignedArtisans = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/admin/work-orders/${workOrderId}/artisans`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setAssignedArtisans(data.artisans || []);
        setTotalLaborCost(data.total_labor_cost || 0);
      }
    } catch (err) {
      console.error("Error fetching assigned artisans:", err);
    }
  };

  const fetchAvailableArtisans = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/admin/artisans`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableArtisans(data.artisans || []);
      }
    } catch (err) {
      console.error("Error fetching artisans:", err);
    }
  };

  const handleOpenArtisanModal = () => {
    fetchAvailableArtisans();
    setSelectedArtisan("");
    setArtisanRole("");
    setArtisanCost("");
    setArtisanNotes("");
    setShowArtisanModal(true);
  };

  const handleAddArtisan = async () => {
    if (!selectedArtisan || !artisanCost) return;

    setAddingArtisan(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/admin/work-orders/${workOrderId}/artisans`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            artisan_id: selectedArtisan,
            role: artisanRole || undefined,
            labor_cost: parseFloat(artisanCost),
            notes: artisanNotes || undefined,
          }),
        },
      );

      if (response.ok) {
        setShowArtisanModal(false);
        fetchAssignedArtisans();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to assign artisan");
      }
    } catch (err) {
      console.error("Error assigning artisan:", err);
      alert("Failed to assign artisan");
    } finally {
      setAddingArtisan(false);
    }
  };

  const handleRemoveArtisan = async (assignmentId: string) => {
    if (!confirm("Remove this artisan from the work order?")) return;

    try {
      const response = await fetch(
        `${BACKEND_URL}/admin/work-orders/${workOrderId}/artisans/${assignmentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        fetchAssignedArtisans();
      }
    } catch (err) {
      console.error("Error removing artisan:", err);
    }
  };

  const handleOpenMaterialModal = () => {
    fetchAvailableMaterials();
    setSelectedMaterial("");
    setMaterialQuantity("");
    setMaterialNotes("");
    setShowMaterialModal(true);
  };

  const handleAddMaterial = async () => {
    if (!selectedMaterial || !materialQuantity) return;

    setAddingMaterial(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/admin/work-orders/${workOrderId}/materials`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            material_id: selectedMaterial,
            quantity: parseFloat(materialQuantity),
            notes: materialNotes || undefined,
          }),
        },
      );

      if (response.ok) {
        setShowMaterialModal(false);
        fetchConsumedMaterials();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to add material");
      }
    } catch (err) {
      console.error("Error adding material:", err);
      alert("Failed to add material");
    } finally {
      setAddingMaterial(false);
    }
  };

  const advanceStage = async () => {
    setAdvancing(true);

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
        fetchWorkOrder();
      } else {
        const data = await response.json();
        alert(data.message || "Failed to advance stage");
      }
    } catch (err) {
      console.error("Error advancing stage:", err);
      alert("Failed to advance stage");
    } finally {
      setAdvancing(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCurrentStageIndex = () => {
    if (!workOrder) return -1;
    return ALL_STAGES.indexOf(workOrder.current_stage);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading work order details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !workOrder) {
    return (
      <div className="p-8">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
          <p className="text-red-400">{error || "Work order not found"}</p>
          <Link
            href="/work-orders"
            className="mt-4 inline-block text-amber-500 hover:text-amber-400"
          >
            ← Back to Work Orders
          </Link>
        </div>
      </div>
    );
  }

  const currentStageIndex = getCurrentStageIndex();
  const isCompleted =
    workOrder.status === "completed" ||
    workOrder.current_stage === "ready_to_ship";

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Link
              href="/work-orders"
              className="text-gray-400 hover:text-gray-900 dark:text-white"
            >
              ← Back
            </Link>
            <span className="text-gray-600">|</span>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {workOrder.title}
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {workOrder.sku && (
              <span className="mr-2">SKU: {workOrder.sku}</span>
            )}
            {workOrder.size && <span>Size: {workOrder.size}</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${PRIORITY_COLORS[workOrder.priority]}`}
          >
            {workOrder.priority}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[workOrder.status]}`}
          >
            {workOrder.status.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-6">
          Production Progress
        </h2>
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-700">
            <div
              className="h-full bg-green-500 transition-all duration-500"
              style={{
                width: `${(currentStageIndex / (ALL_STAGES.length - 1)) * 100}%`,
              }}
            ></div>
          </div>

          {/* Stage Dots */}
          <div className="relative flex justify-between">
            {ALL_STAGES.map((stage, index) => {
              const isCompleted = index < currentStageIndex;
              const isCurrent = index === currentStageIndex;
              const isPending = index > currentStageIndex;

              return (
                <div
                  key={stage}
                  className="flex flex-col items-center"
                  style={{ width: "10%" }}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCompleted
                        ? "bg-green-500 border-green-500 text-gray-900 dark:text-white"
                        : isCurrent
                          ? `${STAGE_COLORS[stage]} border-white`
                          : "bg-gray-800 border-gray-600 text-gray-500"
                    }`}
                  >
                    {isCompleted ? (
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <span className="text-xs">{index + 1}</span>
                    )}
                  </div>
                  <p
                    className={`mt-2 text-xs text-center ${isCurrent ? "text-white font-medium" : "text-gray-500"}`}
                  >
                    {STAGE_LABELS[stage]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Stage & Advance Button */}
        <div className="mt-8 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Current Stage
            </p>
            <p
              className={`text-xl font-bold ${STAGE_COLORS[workOrder.current_stage].replace("bg-", "text-").replace("-500", "-400")}`}
            >
              {STAGE_LABELS[workOrder.current_stage]}
            </p>
          </div>
          {!isCompleted && (
            <button
              onClick={advanceStage}
              disabled={advancing}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-medium rounded-lg transition flex items-center gap-2"
            >
              {advancing ? (
                "Advancing..."
              ) : (
                <>
                  Advance to Next Stage
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
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </>
              )}
            </button>
          )}
          {isCompleted && (
            <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg font-medium">
              ✓ Production Complete
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rug Details Card */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {/* Product Photo - Full width header */}
          {workOrder.thumbnail ? (
            <img
              src={workOrder.thumbnail}
              alt={workOrder.title}
              className="w-full h-56 object-contain bg-gray-100 dark:bg-gray-800"
            />
          ) : workOrder.media && workOrder.media.length > 0 ? (
            <img
              src={workOrder.media[0].url}
              alt={workOrder.title}
              className="w-full h-56 object-contain bg-gray-100 dark:bg-gray-800"
            />
          ) : (
            <div className="w-full h-40 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
              <svg
                className="w-16 h-16 text-amber-400 dark:text-amber-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}

          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Product Details
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Product
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {workOrder.title || "—"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Size
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {workOrder.size || "—"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  SKU
                </span>
                <span className="font-mono text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {workOrder.sku || "—"}
                </span>
              </div>
              {workOrder.metadata && (
                <>
                  {workOrder.metadata.color && (
                    <div className="flex justify-between items-center py-2 border-t border-gray-100 dark:border-gray-800">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Color
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {workOrder.metadata.color}
                      </span>
                    </div>
                  )}
                  {workOrder.metadata.material && (
                    <div className="flex justify-between items-center py-2 border-t border-gray-100 dark:border-gray-800">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Material
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {workOrder.metadata.material}
                      </span>
                    </div>
                  )}
                  {workOrder.metadata.pattern && (
                    <div className="flex justify-between items-center py-2 border-t border-gray-100 dark:border-gray-800">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Pattern
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {workOrder.metadata.pattern}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Details Card */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Details
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Order ID</span>
              <Link
                href={`/orders/${workOrder.order_id}`}
                className="text-amber-500 hover:text-amber-400"
              >
                {workOrder.order_id.slice(0, 20)}...
              </Link>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Due Date</span>
              <span className="text-gray-900 dark:text-white">
                {workOrder.due_date
                  ? formatDate(workOrder.due_date)
                  : "Not set"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Started</span>
              <span className="text-gray-900 dark:text-white">
                {formatDate(workOrder.started_at)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Created</span>
              <span className="text-gray-900 dark:text-white">
                {formatDate(workOrder.created_at)}
              </span>
            </div>
            {workOrder.completed_at && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Completed
                </span>
                <span className="text-green-400">
                  {formatDate(workOrder.completed_at)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Notes Card */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Notes
          </h2>
          {workOrder.notes ? (
            <p className="text-gray-700 dark:text-gray-300">
              {workOrder.notes}
            </p>
          ) : (
            <p className="text-gray-500 italic">No notes added</p>
          )}
        </div>

        {/* Cost Summary Card */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            💰 Cost Summary
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Materials
              </span>
              <span className="font-medium text-blue-500">
                ₹{totalMaterialCost.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Labor
              </span>
              <span className="font-medium text-green-500">
                ₹{totalLaborCost.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Total Cost
              </span>
              <span className="text-lg font-bold text-amber-500">
                ₹{(totalMaterialCost + totalLaborCost).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Stage History */}
        {workOrder.stages && workOrder.stages.length > 0 && (
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Stage History
            </h2>
            <div className="space-y-3">
              {workOrder.stages.map((stage) => (
                <div
                  key={stage.id}
                  className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        stage.status === "completed"
                          ? "bg-green-500"
                          : stage.status === "active"
                            ? "bg-blue-500"
                            : "bg-gray-500"
                      }`}
                    ></div>
                    <span className="text-gray-900 dark:text-white">
                      {STAGE_LABELS[stage.stage as ManufacturingStage] ||
                        stage.stage}
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-sm ${
                        stage.status === "completed"
                          ? "text-green-400"
                          : stage.status === "active"
                            ? "text-blue-400"
                            : "text-gray-500"
                      }`}
                    >
                      {stage.status}
                    </span>
                    {stage.completed_at && (
                      <p className="text-xs text-gray-500">
                        {formatDate(stage.completed_at)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Materials Used Section */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Materials Used
            </h2>
            <button
              onClick={handleOpenMaterialModal}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition flex items-center gap-2"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Material
            </button>
          </div>

          {consumedMaterials.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 italic">
              No materials recorded yet
            </p>
          ) : (
            <>
              <div className="space-y-3 mb-4">
                {consumedMaterials.map((material) => (
                  <div
                    key={material.id}
                    className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800/50 rounded-lg"
                  >
                    <div>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {material.material_name}
                      </span>
                      {material.material_sku && (
                        <span className="text-gray-500 text-sm ml-2">
                          ({material.material_sku})
                        </span>
                      )}
                      {material.notes && (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          {material.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-gray-900 dark:text-white">
                        {material.quantity} {material.material_unit || "units"}
                      </span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ₹{material.total_cost.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 font-medium">
                  Total Material Cost
                </span>
                <span className="text-xl font-bold text-amber-500">
                  ₹{totalMaterialCost.toLocaleString()}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add Material Modal */}
      {showMaterialModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md mx-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Add Material
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Material *
                </label>
                <select
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                >
                  <option value="">Select a material...</option>
                  {availableMaterials.map((mat) => (
                    <option key={mat.id} value={mat.id}>
                      {mat.name} ({mat.current_stock} {mat.unit} available)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={materialQuantity}
                  onChange={(e) => setMaterialQuantity(e.target.value)}
                  placeholder="Enter quantity"
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={materialNotes}
                  onChange={(e) => setMaterialNotes(e.target.value)}
                  placeholder="Optional notes"
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowMaterialModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMaterial}
                disabled={
                  !selectedMaterial || !materialQuantity || addingMaterial
                }
                className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-medium rounded-lg transition"
              >
                {addingMaterial ? "Adding..." : "Add Material"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reference Files Section */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Reference Files
          </h2>
          <div className="flex gap-2">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept="image/*,.pdf,.ai,.psd,.cdr"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const formData = new FormData();
                formData.append("files", file);

                try {
                  // Upload file to Medusa's upload endpoint
                  const uploadRes = await fetch(
                    `${BACKEND_URL}/admin/uploads`,
                    {
                      method: "POST",
                      headers: { Authorization: `Bearer ${token}` },
                      body: formData,
                    },
                  );

                  if (uploadRes.ok) {
                    const data = await uploadRes.json();
                    // Medusa returns { files: [{ url: "..." }] }
                    const url = data.files?.[0]?.url || data.uploads?.[0]?.url;

                    if (url) {
                      // Create media record
                      const mediaRes = await fetch(
                        `${BACKEND_URL}/admin/work-orders/${workOrderId}/media`,
                        {
                          method: "POST",
                          headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            url,
                            category: "reference",
                            caption: file.name,
                            type: file.type.startsWith("image/")
                              ? "image"
                              : "file",
                          }),
                        },
                      );
                      if (mediaRes.ok) {
                        fetchWorkOrder(); // Refresh to get new media
                      }
                    }
                  }
                } catch (err) {
                  console.error("Upload failed:", err);
                }
              }}
            />
            <label
              htmlFor="file-upload"
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-lg cursor-pointer transition"
            >
              + Add Reference
            </label>
            <input
              type="file"
              id="cad-upload"
              className="hidden"
              accept="image/*,.pdf,.ai,.psd,.cdr,.dxf,.dwg"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const formData = new FormData();
                formData.append("files", file);

                try {
                  const uploadRes = await fetch(
                    `${BACKEND_URL}/admin/uploads`,
                    {
                      method: "POST",
                      headers: { Authorization: `Bearer ${token}` },
                      body: formData,
                    },
                  );

                  if (uploadRes.ok) {
                    const data = await uploadRes.json();
                    const url = data.files?.[0]?.url || data.uploads?.[0]?.url;

                    if (url) {
                      const mediaRes = await fetch(
                        `${BACKEND_URL}/admin/work-orders/${workOrderId}/media`,
                        {
                          method: "POST",
                          headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            url,
                            category: "cad",
                            caption: file.name,
                            type: file.type.startsWith("image/")
                              ? "image"
                              : "file",
                          }),
                        },
                      );
                      if (mediaRes.ok) {
                        fetchWorkOrder();
                      }
                    }
                  }
                } catch (err) {
                  console.error("Upload failed:", err);
                }
              }}
            />
            <label
              htmlFor="cad-upload"
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg cursor-pointer transition"
            >
              + Add CAD
            </label>
          </div>
        </div>

        {!workOrder.media || workOrder.media.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
            <svg
              className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p>No reference files uploaded yet</p>
            <p className="text-sm">Upload CAD files or reference images</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {workOrder.media.map((file: any) => (
              <div
                key={file.id}
                className="relative group cursor-pointer"
                onClick={() => setSelectedFile(file)}
              >
                {file.type === "image" ? (
                  <img
                    src={file.url}
                    alt={file.caption || "Reference"}
                    className="w-full h-32 object-cover rounded-lg group-hover:opacity-80 transition"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex flex-col items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition">
                    <svg
                      className="w-10 h-10 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="text-xs text-gray-500 mt-1">File</span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b-lg truncate">
                  {file.caption ||
                    (file.category === "cad" ? "CAD" : "Reference")}
                </div>
                {file.category === "cad" && (
                  <span className="absolute top-1 right-1 text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                    CAD
                  </span>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* File Preview Modal */}
      {selectedFile && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedFile(null)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {selectedFile.caption || "File Preview"}
                </h3>
                {selectedFile.category && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      selectedFile.category === "cad"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                        : "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                    }`}
                  >
                    {selectedFile.category.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <a
                  href={selectedFile.url}
                  download={selectedFile.caption || "file"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition"
                  onClick={(e) => e.stopPropagation()}
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
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download
                </a>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
            {/* Content */}
            <div className="p-4 flex items-center justify-center bg-gray-100 dark:bg-gray-800 min-h-[400px] max-h-[70vh] overflow-auto">
              {selectedFile.type === "image" ? (
                <img
                  src={selectedFile.url}
                  alt={selectedFile.caption || "Preview"}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="text-center">
                  <svg
                    className="w-24 h-24 mx-auto text-gray-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    {selectedFile.caption || "File"}
                  </p>
                  <a
                    href={selectedFile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-500 hover:text-amber-600 underline"
                  >
                    Open in new tab
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assigned Artisans Section */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <span>👷</span> Assigned Artisans
          </h2>
          <button
            onClick={handleOpenArtisanModal}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition"
          >
            + Assign Artisan
          </button>
        </div>

        {assignedArtisans.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No artisans assigned yet
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {assignedArtisans.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {assignment.artisan_name}
                    </p>
                    {assignment.role && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Role: {assignment.role}
                      </p>
                    )}
                    {assignment.notes && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {assignment.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-green-500">
                      ₹{assignment.labor_cost.toLocaleString()}
                    </span>
                    <button
                      onClick={() => handleRemoveArtisan(assignment.id)}
                      className="text-red-500 hover:text-red-600"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400 font-medium">
                Total Labor Cost
              </span>
              <span className="text-xl font-bold text-green-500">
                ₹{totalLaborCost.toLocaleString()}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Total Production Cost */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-6 text-white">
        <div className="flex justify-between items-center">
          <span className="text-lg font-medium opacity-90">
            Total Production Cost
          </span>
          <span className="text-3xl font-bold">
            ₹{(totalMaterialCost + totalLaborCost).toLocaleString()}
          </span>
        </div>
        <div className="flex gap-6 mt-3 text-sm opacity-75">
          <span>Materials: ₹{totalMaterialCost.toLocaleString()}</span>
          <span>Labor: ₹{totalLaborCost.toLocaleString()}</span>
        </div>
      </div>

      {/* Assign Artisan Modal */}
      {showArtisanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md mx-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Assign Artisan
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Artisan *
                </label>
                <select
                  value={selectedArtisan}
                  onChange={(e) => setSelectedArtisan(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                >
                  <option value="">Select an artisan...</option>
                  {availableArtisans.map((art) => (
                    <option key={art.id} value={art.id}>
                      {art.name} {art.role ? `(${art.role})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Role (optional)
                </label>
                <input
                  type="text"
                  value={artisanRole}
                  onChange={(e) => setArtisanRole(e.target.value)}
                  placeholder="e.g., Tufting, Finishing"
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Labor Cost (₹) *
                </label>
                <input
                  type="number"
                  value={artisanCost}
                  onChange={(e) => setArtisanCost(e.target.value)}
                  placeholder="Enter cost for this rug"
                  min="0"
                  step="100"
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={artisanNotes}
                  onChange={(e) => setArtisanNotes(e.target.value)}
                  placeholder="Any special notes..."
                  rows={2}
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowArtisanModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddArtisan}
                disabled={!selectedArtisan || !artisanCost || addingArtisan}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-medium rounded-lg transition"
              >
                {addingArtisan ? "Assigning..." : "Assign Artisan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
