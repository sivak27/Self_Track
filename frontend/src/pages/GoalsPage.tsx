import React, { useState, useEffect } from "react";
import { Plus, Target } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { GoalSummaryCards } from "@/components/goals/GoalSummaryCards";
import { GoalCard } from "@/components/goals/GoalCard";
import { GoalFormModal } from "@/components/goals/GoalFormModal";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useGoals } from "@/hooks/goals/useGoals";
import { Goal, CreateGoalInput } from "@/types/goal";

export function GoalsPage() {
  const {
    goals,
    isLoading,
    totalCount,
    achievedCount,
    inProgressCount,
    financialSavingsTotal,
    addGoal,
    updateGoal,
    incrementGoalProgress,
    deleteGoal,
  } = useGoals();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    document.title = "Goals & Milestones | Personal Control Center";
  }, []);

  const handleOpenAdd = () => {
    setGoalToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (goal: Goal) => {
    setGoalToEdit(goal);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: CreateGoalInput) => {
    if (goalToEdit) {
      await updateGoal(goalToEdit.id, data);
    } else {
      await addGoal(data);
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      setIsDeleting(true);
      await deleteGoal(deletingId);
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Goals & Milestones"
        description="Establish long-term financial freedom targets, savings horizons, and personal productivity benchmarks."
      >
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal Target</span>
        </button>
      </PageHeader>

      <GoalSummaryCards
        totalCount={totalCount}
        achievedCount={achievedCount}
        inProgressCount={inProgressCount}
        savingsTotal={financialSavingsTotal}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <LoadingSkeleton count={3} className="h-56 w-full" />
        </div>
      ) : goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No Goals Defined"
          description="Define a savings target, milestone achievement, or personal habit goal to start logging progress."
          actionLabel="Set First Goal"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={handleEdit}
              onDelete={(id) => setDeletingId(id)}
              onIncrement={incrementGoalProgress}
            />
          ))}
        </div>
      )}

      <GoalFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        goalToEdit={goalToEdit}
      />

      <ConfirmDialog
        isOpen={!!deletingId}
        title="Delete Milestone Goal"
        message="Are you sure you want to delete this goal? All recorded progress towards this milestone will be lost."
        confirmLabel="Delete Goal"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
