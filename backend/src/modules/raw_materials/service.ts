import { MedusaService } from "@medusajs/framework/utils";
import {
  Material,
  MATERIAL_CATEGORIES,
  MATERIAL_UNITS,
} from "./models/material";
import { Supplier } from "./models/supplier";
import { StockMovement, MOVEMENT_TYPES } from "./models/stock-movement";
import { PurchaseOrder, PO_STATUSES } from "./models/purchase-order";
import { PurchaseOrderItem } from "./models/purchase-order-item";

class RawMaterialsService extends MedusaService({
  Material,
  Supplier,
  StockMovement,
  PurchaseOrder,
  PurchaseOrderItem,
}) {
  /**
   * Adjust stock for a material
   */
  async adjustStock(
    materialId: string,
    quantity: number,
    type: "in" | "out" | "adjust",
    options?: {
      reason?: string;
      notes?: string;
      work_order_id?: string;
      created_by?: string;
    },
  ): Promise<{ material: any; movement: any }> {
    // Get current material
    const material = await this.retrieveMaterial(materialId);
    if (!material) {
      throw new Error(`Material ${materialId} not found`);
    }

    const stockBefore = material.current_stock;
    let stockAfter: number;

    // Calculate new stock
    if (type === "in") {
      stockAfter = stockBefore + quantity;
    } else if (type === "out") {
      stockAfter = stockBefore - quantity;
      if (stockAfter < 0) {
        throw new Error(
          `Insufficient stock. Current: ${stockBefore}, Requested: ${quantity}`,
        );
      }
    } else {
      // adjust - quantity is the new absolute value
      stockAfter = quantity;
    }

    // Update material stock
    const updatedMaterial = await this.updateMaterials({
      id: materialId,
      current_stock: stockAfter,
    });

    // Create movement record
    const movement = await this.createStockMovements({
      material_id: materialId,
      type,
      quantity: type === "adjust" ? stockAfter - stockBefore : quantity,
      reason: options?.reason,
      notes: options?.notes,
      work_order_id: options?.work_order_id,
      created_by: options?.created_by,
      stock_before: stockBefore,
      stock_after: stockAfter,
    });

    return { material: updatedMaterial, movement };
  }

  /**
   * Get materials with low stock
   */
  async getLowStockMaterials(): Promise<any[]> {
    const materials = await this.listMaterials({
      is_active: true,
    });

    return materials.filter((m: any) => m.current_stock <= m.min_stock_level);
  }

  /**
   * Get all material categories
   */
  getCategories(): readonly string[] {
    return MATERIAL_CATEGORIES;
  }

  /**
   * Get all units
   */
  getUnits(): readonly string[] {
    return MATERIAL_UNITS;
  }

  /**
   * Get all movement types
   */
  getMovementTypes(): readonly string[] {
    return MOVEMENT_TYPES;
  }
}

export default RawMaterialsService;
