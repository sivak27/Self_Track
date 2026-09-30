import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, CheckSquare } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { TaskSummaryCards } from "@/components/tasks/TaskSummaryCards";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskKanbanBoard } from "@/components/tasks/TaskKanbanBoard";
import { TaskFormModal } from "@/components/tasks/TaskFormModal";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useTasks } from "@/hooks/tasks/useTasks";
import { Task, CreateTaskInput, TaskStatus } from "@/types/task";

export function TasksPage() {
  const [searchParams] = useSearchParams();
  const initialProjectId = searchParams.get("projectId") || undefined;

  const {
    tasks,
    projects,
    filters,
    setFilters,
    isLoading,
    totalCount,
    completedCount,
    inProgressCount,
    urgentCount,
    addTask,
    updateTask,
    toggleTaskStatus,
    deleteTask,
  } = useTasks(initialProjectId ? { projectId: initialProjectId } : undefined);

  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    document.title = "Tasks & Execution | Personal Control Center";
  }, []);

  const handleOpenAdd = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (task: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: CreateTaskInput) => {
    if (taskToEdit) {
      await updateTask(taskToEdit.id, data);
    } else {
      await addTask(data);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: TaskStatus) => {
    await updateTask(id, { status: newStatus });
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      setIsDeleting(true);
      await deleteTask(deletingId);
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks & Execution"
        description="Streamlined Kanban sprint board and list view for daily action items and deliverables."
      >
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Task Item</span>
        </button>
      </PageHeader>

      <TaskSummaryCards
        totalCount={totalCount}
        completedCount={completedCount}
        inProgressCount={inProgressCount}
        urgentCount={urgentCount}
      />

      <TaskFilters
        filters={filters}
        projects={projects}
        onChange={setFilters}
        viewMode={viewMode}
        onToggleView={setViewMode}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <LoadingSkeleton count={4} className="h-64 w-full" />
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No Tasks Found"
          description="Your task board is clear! Create an action item to start making progress on your projects."
          actionLabel="Create Action Item"
          onAction={handleOpenAdd}
        />
      ) : viewMode === "kanban" ? (
        <TaskKanbanBoard
          tasks={tasks}
          onToggleStatus={toggleTaskStatus}
          onUpdateStatus={handleUpdateStatus}
          onEdit={handleEdit}
          onDelete={(id) => setDeletingId(id)}
        />
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleStatus={toggleTaskStatus}
              onEdit={handleEdit}
              onDelete={(id) => setDeletingId(id)}
            />
          ))}
        </div>
      )}

      <TaskFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        taskToEdit={taskToEdit}
        projects={projects}
        defaultProjectId={filters.projectId}
      />

      <ConfirmDialog
        isOpen={!!deletingId}
        title="Delete Action Item"
        message="Are you sure you want to permanently delete this task?"
        confirmLabel="Delete Task"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
