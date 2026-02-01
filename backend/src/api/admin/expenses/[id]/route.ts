import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

/**
 * GET /admin/expenses/:id - Get single expense
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const financeService = req.scope.resolve("finance") as any;
    const { id } = req.params;

    const expense = await financeService.retrieveExpense(id);

    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    return res.json({ expense });
  } catch (error) {
    console.error("Error retrieving expense:", error);
    return res.status(500).json({ error: "Failed to retrieve expense" });
  }
}

/**
 * PATCH /admin/expenses/:id - Update expense
 */
export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
  try {
    const financeService = req.scope.resolve("finance") as any;
    const { id } = req.params;

    const {
      category,
      amount,
      title,
      description,
      paid_status,
      paid_at,
      expense_date,
      vendor,
      reference_number,
      metadata,
    } = req.body as {
      category?: string;
      amount?: number;
      title?: string;
      description?: string;
      paid_status?: string;
      paid_at?: string;
      expense_date?: string;
      vendor?: string;
      reference_number?: string;
      metadata?: Record<string, any>;
    };

    const updates: any = {};
    if (category !== undefined) updates.category = category;
    if (amount !== undefined) updates.amount = amount;
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (paid_status !== undefined) updates.paid_status = paid_status;
    if (paid_at !== undefined) updates.paid_at = new Date(paid_at);
    if (expense_date !== undefined)
      updates.expense_date = new Date(expense_date);
    if (vendor !== undefined) updates.vendor = vendor;
    if (reference_number !== undefined)
      updates.reference_number = reference_number;
    if (metadata !== undefined) updates.metadata = metadata;

    // Auto-set paid_at when marking as paid
    if (paid_status === "paid" && !paid_at) {
      updates.paid_at = new Date();
    }

    const expense = await financeService.updateExpenses({
      id,
      ...updates,
    });

    return res.json({ expense });
  } catch (error) {
    console.error("Error updating expense:", error);
    return res.status(500).json({ error: "Failed to update expense" });
  }
}

/**
 * DELETE /admin/expenses/:id - Delete expense
 */
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  try {
    const financeService = req.scope.resolve("finance") as any;
    const { id } = req.params;

    await financeService.deleteExpenses(id);

    return res.json({ success: true });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return res.status(500).json({ error: "Failed to delete expense" });
  }
}
