import { MedusaService } from "@medusajs/framework/utils";
import { WorkOrder, MANUFACTURING_STAGES } from "./models/work-order";
import { WorkOrderStage } from "./models/work-order-stage";
import { WorkOrderMedia } from "./models/work-order-media";
import { Artisan } from "./models/artisan";

class ManufacturingService extends MedusaService({
  WorkOrder,
  WorkOrderStage,
  WorkOrderMedia,
  Artisan,
}) {
  /**
   * Get the next stage in the manufacturing process
   */
  getNextStage(currentStage: string): string | null {
    const currentIndex = MANUFACTURING_STAGES.indexOf(
      currentStage as (typeof MANUFACTURING_STAGES)[number],
    );
    if (
      currentIndex === -1 ||
      currentIndex === MANUFACTURING_STAGES.length - 1
    ) {
      return null;
    }
    return MANUFACTURING_STAGES[currentIndex + 1];
  }

  /**
   * Get the previous stage in the manufacturing process
   */
  getPreviousStage(currentStage: string): string | null {
    const currentIndex = MANUFACTURING_STAGES.indexOf(
      currentStage as (typeof MANUFACTURING_STAGES)[number],
    );
    if (currentIndex <= 0) {
      return null;
    }
    return MANUFACTURING_STAGES[currentIndex - 1];
  }

  /**
   * Check if stage is valid
   */
  isValidStage(stage: string): boolean {
    return MANUFACTURING_STAGES.includes(
      stage as (typeof MANUFACTURING_STAGES)[number],
    );
  }

  /**
   * Get all stages
   */
  getAllStages(): readonly string[] {
    return MANUFACTURING_STAGES;
  }
}

export default ManufacturingService;
