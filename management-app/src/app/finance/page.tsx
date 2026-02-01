"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

interface FinanceSummary {
  total_revenue: number;
  order_count: number;
  total_expenses: number;
  gross_profit: number;
  profit_margin: number;
  expenses_by_category: Record<string, number>;
  unpaid_expenses: number;
  unpaid_purchase_orders: number;
  unpaid_labor: number;
  total_unpaid: number;
}

interface Expense {
  id: string;
  category: string;
  amount: number;
  title: string;
  description?: string;
  paid_status: string;
  expense_date: string;
  vendor?: string;
}

interface PurchaseOrder {
  id: string;
  supplier_name?: string;
  subtotal: number;
  status: string;
  paid_status: string;
  created_at: string;
}

interface ArtisanPayment {
  id: string;
  artisan_id: string;
  labor_cost: number;
  paid_status: string;
  work_order_id: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  materials: "📦",
  labor: "👷",
  overhead: "🏢",
  shipping: "🚚",
  utilities: "⚡",
  equipment: "🔧",
  other: "📋",
};

const CATEGORY_COLORS: Record<string, string> = {
  materials: "bg-blue-500",
  labor: "bg-green-500",
  overhead: "bg-purple-500",
  shipping: "bg-orange-500",
  utilities: "bg-yellow-500",
  equipment: "bg-red-500",
  other: "bg-gray-500",
};

export default function FinancePage() {
  const { token, isAuthenticated } = useAuth();
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [unpaidPOs, setUnpaidPOs] = useState<PurchaseOrder[]>([]);
  const [unpaidLabor, setUnpaidLabor] = useState<ArtisanPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add expense modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: "other",
    amount: "",
    title: "",
    description: "",
    vendor: "",
    expense_date: new Date().toISOString().split("T")[0],
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchFinanceData();
    }
  }, [isAuthenticated, token]);

  const fetchFinanceData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch finance summary
      const summaryRes = await fetch(`${BACKEND_URL}/admin/finance/summary`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (summaryRes.ok) {
        const data = await summaryRes.json();
        setSummary(data.summary);
        setUnpaidPOs(data.unpaid_purchase_orders || []);
        setUnpaidLabor(data.unpaid_artisan_payments || []);
      }

      // Fetch recent expenses
      const expensesRes = await fetch(
        `${BACKEND_URL}/admin/expenses?limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (expensesRes.ok) {
        const data = await expensesRes.json();
        setExpenses(data.expenses || []);
      }
    } catch (err) {
      console.error("Error fetching finance data:", err);
      setError("Failed to load finance data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.title || !newExpense.amount) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/admin/expenses`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newExpense,
          amount: parseFloat(newExpense.amount),
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewExpense({
          category: "other",
          amount: "",
          title: "",
          description: "",
          vendor: "",
          expense_date: new Date().toISOString().split("T")[0],
        });
        fetchFinanceData();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to add expense");
      }
    } catch (err) {
      console.error("Error adding expense:", err);
      alert("Failed to add expense");
    } finally {
      setSubmitting(false);
    }
  };

  const markExpensePaid = async (expenseId: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/admin/expenses/${expenseId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paid_status: "paid" }),
      });

      if (res.ok) {
        fetchFinanceData();
      }
    } catch (err) {
      console.error("Error marking expense as paid:", err);
    }
  };

  const markArtisanPaid = async (workOrderId: string, assignmentId: string) => {
    try {
      const res = await fetch(
        `${BACKEND_URL}/admin/work-orders/${workOrderId}/artisans/${assignmentId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ paid_status: "paid" }),
        },
      );

      if (res.ok) {
        fetchFinanceData();
      }
    } catch (err) {
      console.error("Error marking artisan as paid:", err);
    }
  };

  const markPOPaid = async (poId: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/admin/purchase-orders/${poId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paid_status: "paid" }),
      });

      if (res.ok) {
        fetchFinanceData();
      }
    } catch (err) {
      console.error("Error marking PO as paid:", err);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading finance data...
          </p>
        </div>
      </div>
    );
  }

  const totalExpenses = summary?.total_expenses || 0;
  const expensesByCategory = summary?.expenses_by_category || {};

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Finance
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track expenses, payments, and financial overview
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
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
          Add Expense
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          {error}
        </div>
      )}

      {/* KPI Cards - Row 1: Revenue & Profit */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <p className="text-sm text-gray-600 dark:text-gray-400">💰 Revenue</p>
          <p className="text-2xl font-bold text-green-500 mt-1">
            {formatCurrency(summary?.total_revenue || 0)}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {summary?.order_count || 0} orders
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <p className="text-sm text-gray-600 dark:text-gray-400">📦 Orders</p>
          <p className="text-2xl font-bold text-blue-500 mt-1">
            {summary?.order_count || 0}
          </p>
          <p className="text-xs text-gray-500 mt-2">Total orders</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            💸 Expenses
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {formatCurrency(totalExpenses)}
          </p>
          <p className="text-xs text-gray-500 mt-2">All recorded</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            📈 Gross Profit
          </p>
          <p
            className={`text-2xl font-bold mt-1 ${(summary?.gross_profit || 0) >= 0 ? "text-green-500" : "text-red-500"}`}
          >
            {formatCurrency(summary?.gross_profit || 0)}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {(summary?.profit_margin || 0).toFixed(1)}% margin
          </p>
        </div>
      </div>

      {/* KPI Cards - Row 2: Unpaid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <p className="text-sm text-gray-600 dark:text-gray-400">Unpaid POs</p>
          <p className="text-2xl font-bold text-orange-500 mt-1">
            {formatCurrency(summary?.unpaid_purchase_orders || 0)}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {unpaidPOs.length} pending
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Unpaid Labor
          </p>
          <p className="text-2xl font-bold text-purple-500 mt-1">
            {formatCurrency(summary?.unpaid_labor || 0)}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {unpaidLabor.length} artisans
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Unpaid
          </p>
          <p className="text-2xl font-bold text-red-500 mt-1">
            {formatCurrency(summary?.total_unpaid || 0)}
          </p>
          <p className="text-xs text-gray-500 mt-2">All pending</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            📊 Profit Margin
          </p>
          <p
            className={`text-2xl font-bold mt-1 ${(summary?.profit_margin || 0) >= 0 ? "text-amber-500" : "text-red-500"}`}
          >
            {(summary?.profit_margin || 0).toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 mt-2">Revenue - Expenses</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Expenses by Category */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Expenses by Category
          </h2>
          <div className="space-y-3">
            {Object.entries(expensesByCategory).length > 0 ? (
              Object.entries(expensesByCategory).map(([category, amount]) => {
                const percentage = (amount / totalExpenses) * 100;
                return (
                  <div key={category} className="flex items-center gap-3">
                    <span className="text-xl">
                      {CATEGORY_ICONS[category] || "📋"}
                    </span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 dark:text-gray-300 capitalize">
                          {category}
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {formatCurrency(amount)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${CATEGORY_COLORS[category] || "bg-gray-500"}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-4">
                No expenses recorded yet
              </p>
            )}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Expenses
            </h2>
          </div>
          <div className="space-y-3">
            {expenses.length > 0 ? (
              expenses.slice(0, 5).map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {CATEGORY_ICONS[expense.category] || "📋"}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {expense.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(expense.expense_date)}
                        {expense.vendor && ` • ${expense.vendor}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(expense.amount)}
                    </p>
                    {expense.paid_status === "unpaid" ? (
                      <button
                        onClick={() => markExpensePaid(expense.id)}
                        className="text-xs text-amber-500 hover:text-amber-400"
                      >
                        Mark Paid
                      </button>
                    ) : (
                      <span className="text-xs text-green-500">Paid</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                No expenses recorded yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Unpaid Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unpaid Purchase Orders */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Unpaid Purchase Orders
            </h2>
            <Link
              href="/purchase-orders"
              className="text-sm text-amber-500 hover:text-amber-400"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {unpaidPOs.length > 0 ? (
              unpaidPOs.slice(0, 5).map((po) => (
                <div
                  key={po.id}
                  className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800/50 rounded-lg"
                >
                  <Link
                    href={`/purchase-orders/${po.id}`}
                    className="flex-1 hover:opacity-80"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {po.supplier_name || po.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {po.status}
                    </p>
                  </Link>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-medium text-orange-500">
                      {formatCurrency(po.subtotal)}
                    </p>
                    <button
                      onClick={() => markPOPaid(po.id)}
                      className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
                      title="Mark as Paid"
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                All purchase orders paid
              </p>
            )}
          </div>
        </div>

        {/* Unpaid Labor */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Unpaid Artisan Labor
            </h2>
            <Link
              href="/artisans"
              className="text-sm text-amber-500 hover:text-amber-400"
            >
              View Artisans →
            </Link>
          </div>
          <div className="space-y-3">
            {unpaidLabor.length > 0 ? (
              unpaidLabor.slice(0, 5).map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800/50 rounded-lg"
                >
                  <Link
                    href={`/work-orders/${payment.work_order_id}`}
                    className="flex-1 hover:opacity-80"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Work Order: {payment.work_order_id.slice(0, 8)}...
                    </p>
                    <p className="text-xs text-gray-500">
                      Artisan: {payment.artisan_id.slice(0, 8)}...
                    </p>
                  </Link>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-medium text-purple-500">
                      {formatCurrency(payment.labor_cost)}
                    </p>
                    <button
                      onClick={() =>
                        markArtisanPaid(payment.work_order_id, payment.id)
                      }
                      className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
                      title="Mark as Paid"
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                All labor payments up to date
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md mx-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Add Expense
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={newExpense.title}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, title: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  placeholder="Expense title"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newExpense.amount}
                    onChange={(e) =>
                      setNewExpense({ ...newExpense, amount: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Category
                  </label>
                  <select
                    value={newExpense.category}
                    onChange={(e) =>
                      setNewExpense({ ...newExpense, category: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  >
                    <option value="materials">📦 Materials</option>
                    <option value="labor">👷 Labor</option>
                    <option value="overhead">🏢 Overhead</option>
                    <option value="shipping">🚚 Shipping</option>
                    <option value="utilities">⚡ Utilities</option>
                    <option value="equipment">🔧 Equipment</option>
                    <option value="other">📋 Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={newExpense.expense_date}
                  onChange={(e) =>
                    setNewExpense({
                      ...newExpense,
                      expense_date: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Vendor
                </label>
                <input
                  type="text"
                  value={newExpense.vendor}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, vendor: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  placeholder="Vendor name (optional)"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Description
                </label>
                <textarea
                  value={newExpense.description}
                  onChange={(e) =>
                    setNewExpense({
                      ...newExpense,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  placeholder="Optional notes"
                  rows={2}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddExpense}
                disabled={!newExpense.title || !newExpense.amount || submitting}
                className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-medium rounded-lg transition"
              >
                {submitting ? "Adding..." : "Add Expense"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
