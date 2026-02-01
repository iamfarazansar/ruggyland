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
  thumbnail?: string | null;
  metadata?: {
    thumbnail?: string;
    color?: string;
    material?: string;
    pattern?: string;
    customizations?: Record<string, any>;
  };
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

/**
 * Type definitions for Inventory/Raw Materials module
 */

export type MaterialCategory =
  | "yarn"
  | "backing"
  | "supplies"
  | "tools"
  | "chemicals";
export type MaterialUnit = "kg" | "meters" | "pieces" | "liters" | "rolls";
export type MovementType = "in" | "out" | "adjust";

export interface Material {
  id: string;
  name: string;
  sku: string | null;
  description: string | null;
  category: MaterialCategory;
  unit: MaterialUnit;
  current_stock: number;
  min_stock_level: number;
  cost_per_unit: number;
  color: string | null;
  weight_type: string | null;
  supplier_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  material_id: string;
  type: MovementType;
  quantity: number;
  reason: string | null;
  notes: string | null;
  work_order_id: string | null;
  created_by: string | null;
  stock_before: number;
  stock_after: number;
  created_at: string;
}

export const MATERIAL_CATEGORY_LABELS: Record<MaterialCategory, string> = {
  yarn: "Yarn",
  backing: "Backing",
  supplies: "Supplies",
  tools: "Tools",
  chemicals: "Chemicals",
};

export const MATERIAL_CATEGORY_COLORS: Record<MaterialCategory, string> = {
  yarn: "bg-purple-500",
  backing: "bg-orange-500",
  supplies: "bg-blue-500",
  tools: "bg-gray-500",
  chemicals: "bg-yellow-500",
};

export const MATERIAL_UNIT_LABELS: Record<MaterialUnit, string> = {
  kg: "Kilograms",
  meters: "Meters",
  pieces: "Pieces",
  liters: "Liters",
  rolls: "Rolls",
};

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

// Product types for product creation
export interface ProductImage {
  id?: string;
  url: string;
  file?: File;
}

export interface ProductOption {
  title: string;
  values: string[];
}

export interface ProductVariantPrice {
  amount: number;
  currency_code: string;
  region_id?: string; // For region-based pricing
}

export interface ProductVariant {
  title: string;
  sku?: string;
  options?: Record<string, string>;
  prices: ProductVariantPrice[];
  region_prices?: Record<string, number>; // region_id -> amount
  manage_inventory?: boolean;
}

export interface CreateProductInput {
  title: string;
  description?: string;
  handle?: string;
  status?: "draft" | "published";
  images?: { url: string }[];
  options?: ProductOption[];
  variants?: ProductVariant[];
  weight?: number;
  collection_id?: string;
  category_ids?: string[];
}

export interface ProductFormData {
  shipping_profiles: { id: string; name: string; type: string }[];
  categories: { id: string; name: string }[];
  collections: { id: string; title: string }[];
  product_types?: { id: string; value: string }[];
  sales_channels?: { id: string; name: string }[];
}
