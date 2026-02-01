import { MedusaService } from "@medusajs/framework/utils";
import { Expense } from "./models/expense";

class FinanceService extends MedusaService({
  Expense,
}) {
  /**
   * Get expenses summary by category
   */
  async getExpensesByCategory(
    startDate?: Date,
    endDate?: Date,
  ): Promise<Record<string, number>> {
    const filters: any = {};

    if (startDate || endDate) {
      filters.expense_date = {};
      if (startDate) filters.expense_date.$gte = startDate;
      if (endDate) filters.expense_date.$lte = endDate;
    }

    const expenses = await this.listExpenses(filters);

    const byCategory: Record<string, number> = {};
    for (const expense of expenses) {
      const category = (expense as any).category || "other";
      byCategory[category] =
        (byCategory[category] || 0) + (expense as any).amount;
    }

    return byCategory;
  }

  /**
   * Get total expenses for a period
   */
  async getTotalExpenses(startDate?: Date, endDate?: Date): Promise<number> {
    const byCategory = await this.getExpensesByCategory(startDate, endDate);
    return Object.values(byCategory).reduce((sum, val) => sum + val, 0);
  }

  /**
   * Get unpaid expenses
   */
  async getUnpaidExpenses(): Promise<any[]> {
    return this.listExpenses({
      paid_status: "unpaid",
    });
  }
}

export default FinanceService;
