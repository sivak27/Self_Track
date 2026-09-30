import React, { useState, useEffect } from "react";
import { Plus, Tag } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { ExpenseSummaryCards } from "@/components/expenses/ExpenseSummaryCards";
import { ExpenseFilters } from "@/components/expenses/ExpenseFilters";
import { ExpenseList } from "@/components/expenses/ExpenseList";
import { ExpenseFormModal } from "@/components/expenses/ExpenseFormModal";
import { useExpenses } from "@/hooks/expenses/useExpenses";
import { Expense, CreateExpenseInput } from "@/types/expense";

export function ExpensesPage() {
  const {
    expenses,
    categories,
    filters,
    setFilters,
    isLoading,
    totalAmount,
    recurringTotal,
    addExpense,
    updateExpense,
    deleteExpense,
    addCategory,
  } = useExpenses();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#06B6D4");

  useEffect(() => {
    document.title = "Expense Tracking | Personal Control Center";
  }, []);

  const handleOpenAddModal = () => {
    setExpenseToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setExpenseToEdit(expense);
    setIsModalOpen(true);
  };

  const handleSubmitExpense = async (data: CreateExpenseInput) => {
    if (expenseToEdit) {
      await updateExpense(expenseToEdit.id, data);
    } else {
      await addExpense(data);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    await addCategory(newCategoryName.trim(), newCategoryColor);
    setNewCategoryName("");
    setIsCategoryModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expense Tracking"
        description="Monitor personal outflows, recurring subscriptions, and budget categories."
      >
        <button
          onClick={() => setIsCategoryModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 transition-colors shadow-xs"
        >
          <Tag className="w-3.5 h-3.5 text-indigo-600" />
          <span>New Category</span>
        </button>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Record Expense</span>
        </button>
      </PageHeader>

      <ExpenseSummaryCards
        totalAmount={totalAmount}
        recurringTotal={recurringTotal}
        count={expenses.length}
        categoriesCount={categories.length}
      />

      <ExpenseFilters
        filters={filters}
        categories={categories}
        onChange={setFilters}
      />

      <ExpenseList
        expenses={expenses}
        isLoading={isLoading}
        onEdit={handleEditExpense}
        onDelete={deleteExpense}
        onAddNew={handleOpenAddModal}
      />

      <ExpenseFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitExpense}
        expenseToEdit={expenseToEdit}
        categories={categories}
      />

      {/* Add Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add Custom Category</h3>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Pet Care, Books, Travel"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Color Accent
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={newCategoryColor}
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                    className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-slate-600 font-semibold">{newCategoryColor}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
