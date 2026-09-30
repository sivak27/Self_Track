"use client";

import React from "react";
import { Task, TaskStatus } from "@/types/task";
import { TaskCard } from "./TaskCard";
import { ArrowRight, ArrowLeft } from "lucide-react";

interface TaskKanbanBoardProps {
  tasks: Task[];
  onToggleStatus: (id: string, currentStatus: TaskStatus) => void;
  onUpdateStatus: (id: string, newStatus: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: "todo", title: "To Do", color: "text-slate-700" },
  { id: "in_progress", title: "In Progress", color: "text-indigo-700" },
  { id: "review", title: "Review", color: "text-amber-700" },
  { id: "completed", title: "Completed", color: "text-emerald-700" },
];

export function TaskKanbanBoard({
  tasks,
  onToggleStatus,
  onUpdateStatus,
  onEdit,
  onDelete,
}: TaskKanbanBoardProps) {
  const getNextStatus = (current: TaskStatus): TaskStatus | null => {
    if (current === "todo") return "in_progress";
    if (current === "in_progress") return "review";
    if (current === "review") return "completed";
    return null;
  };

  const getPrevStatus = (current: TaskStatus): TaskStatus | null => {
    if (current === "completed") return "review";
    if (current === "review") return "in_progress";
    if (current === "in_progress") return "todo";
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div
            key={col.id}
            className="rounded-2xl border border-slate-200 bg-slate-50/75 p-4 flex flex-col gap-3 min-h-[500px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className={`text-xs font-bold uppercase tracking-wider ${col.color}`}>
                {col.title}
              </span>
              <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 shadow-xs">
                {colTasks.length}
              </span>
            </div>

            {/* Column Cards */}
            <div className="space-y-3 flex-1">
              {colTasks.length === 0 ? (
                <div className="h-32 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-xs text-slate-400 bg-white/50">
                  No items
                </div>
              ) : (
                colTasks.map((task) => {
                  const next = getNextStatus(task.status);
                  const prev = getPrevStatus(task.status);

                  return (
                    <div key={task.id} className="relative group/kanban">
                      <TaskCard
                        task={task}
                        onToggleStatus={onToggleStatus}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />

                      {/* Stage Transition Controls */}
                      <div className="mt-1 flex items-center justify-between px-1">
                        {prev ? (
                          <button
                            onClick={() => onUpdateStatus(task.id, prev)}
                            className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors font-medium"
                            title={`Move to ${prev.replace("_", " ")}`}
                          >
                            <ArrowLeft className="w-3 h-3" />
                            Prev
                          </button>
                        ) : <span />}

                        {next ? (
                          <button
                            onClick={() => onUpdateStatus(task.id, next)}
                            className="text-[10px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors ml-auto font-semibold"
                            title={`Move to ${next.replace("_", " ")}`}
                          >
                            Next
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : <span />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
