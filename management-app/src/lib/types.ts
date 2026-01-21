/**
 * Type definitions for Manufacturing module
 */

export type ManufacturingStage =
  | "design_approved"
  | "yarn_planning"
  | "tufting"
  | "trimming"
  | "washing"
  | "drying"
  | "finishing"
  | "qc"
  | "packing"
  | "ready_to_ship";

export type WorkOrderStatus =
  | "pending"
  | "in_progress"
  | "on_hold"
  | "completed"
  | "cancelled";

export type Priority = "low" | "normal" | "high" | "urgent";

export interface WorkOrder {
  id: string;
  order_id: string;
  order_item_id: string;
  title: string;
  size: string | null;
  sku: string | null;
  current_stage: ManufacturingStage;
  status: WorkOrderStatus;
  priority: Priority;
  assigned_to: string | null;
  due_date: string | null;
  started_at: string | null;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  stages?: WorkOrderStage[];
  media?: WorkOrderMedia[];
}

export interface WorkOrderStage {
  id: string;
  work_order_id: string;
  stage: ManufacturingStage;
  status: "pending" | "active" | "completed" | "skipped";
  started_at: string | null;
  completed_at: string | null;
  assigned_to: string | null;
  notes: string | null;
  quality_score: number | null;
}

export interface WorkOrderMedia {
  id: string;
  work_order_id: string;
  stage_id: string | null;
  url: string;
  type: "image" | "video";
  caption: string | null;
  uploaded_by: string | null;
  uploaded_at: string | null;
}

export interface Artisan {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  specialties: string[] | null;
  active: boolean;
  completed_orders: number;
  average_rating: number | null;
}

export const STAGE_LABELS: Record<ManufacturingStage, string> = {
  design_approved: "Design Approved",
  yarn_planning: "Yarn Planning",
  tufting: "Tufting",
  trimming: "Trimming",
  washing: "Washing",
  drying: "Drying",
  finishing: "Finishing",
  qc: "Quality Check",
  packing: "Packing",
  ready_to_ship: "Ready to Ship",
};

export const STAGE_COLORS: Record<ManufacturingStage, string> = {
  design_approved: "bg-blue-500",
  yarn_planning: "bg-purple-500",
  tufting: "bg-orange-500",
  trimming: "bg-yellow-500",
  washing: "bg-cyan-500",
  drying: "bg-teal-500",
  finishing: "bg-green-500",
  qc: "bg-red-500",
  packing: "bg-indigo-500",
  ready_to_ship: "bg-emerald-500",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  low: "bg-gray-400",
  normal: "bg-blue-500",
  high: "bg-orange-500",
  urgent: "bg-red-600",
};

export const STATUS_COLORS: Record<WorkOrderStatus, string> = {
  pending: "bg-gray-400",
  in_progress: "bg-blue-500",
  on_hold: "bg-yellow-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
};
