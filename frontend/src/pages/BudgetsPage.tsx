import React, { useState, useEffect } from "react";
import { Plus, PieChart } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { BudgetSummaryCards } from "@/components/budgets/BudgetSummaryCards";
import { BudgetCard } from "@/components/budgets/BudgetCard";
import { BudgetFormModal } from "@/components/budgets/BudgetFormModal";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useBudgets } from "@/hooks/budgets/useBudgets";
import { Budget, CreateBudgetInput } from "@/types/budget";

export function BudgetsPage() {
  const {
    budgets,
    categories,
    isLoading,
    totalAllocated,
    totalSpent,
    totalRemaining,
    overBudgetCount,
    addBudget,
    updateBudget,
    deleteBudget,
  } = useBudgets();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    document.title = "Budgets & Envelopes | Personal Control Center";
  }, []);

  const handleOpenAdd = () => {
    setBudgetToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (budget: Budget) => {
    setBudgetToEdit(budget);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: CreateBudgetInput) => {
    if (budgetToEdit) {
      await updateBudget(budgetToEdit.id, data);
    } else {
      await addBudget(data);
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      setIsDeleting(true);
      await deleteBudget(deletingId);
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Budgets & Envelopes"
        description="Establish spending guardrails per category, track real-time burn rates, and receive limit alerts."
      >
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Budget Envelope</span>
        </button>
      </PageHeader>

      <BudgetSummaryCards
        totalAllocated={totalAllocated}
        totalSpent={totalSpent}
        totalRemaining={totalRemaining}
        overBudgetCount={overBudgetCount}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <LoadingSkeleton count={3} className="h-44 w-full" />
        </div>
      ) : budgets.length === 0 ? (
        <EmptyState
          icon={PieChart}
          title="No Budget Envelopes Created"
          description="Allocate budget limits to your expense categories to prevent overspending and ensure savings."
          actionLabel="Create First Envelope"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onEdit={handleEdit}
              onDelete={(id) => setDeletingId(id)}
            />
          ))}
        </div>
      )}

      <BudgetFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        budgetToEdit={budgetToEdit}
        categories={categories}
      />

      <ConfirmDialog
        isOpen={!!deletingId}
        title="Delete Budget Envelope"
        message="Are you sure you want to remove this budget envelope? Category expenses will remain unaffected."
        confirmLabel="Delete Envelope"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
