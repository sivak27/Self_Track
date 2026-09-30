"use client";

import React from "react";
import { Edit2, Trash2, Calendar, Check, Clock } from "lucide-react";
import { Task, TaskStatus } from "@/types/task";
import { formatDate, isPastDate } from "@/lib/utils/date";

interface TaskCardProps {
  task: Task;
  onToggleStatus: (id: string, currentStatus: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const priorityConfig = {
  urgent: "text-rose-700 bg-rose-50 border-rose-200",
  high: "text-amber-700 bg-amber-50 border-amber-200",
  medium: "text-indigo-700 bg-indigo-50 border-indigo-200",
  low: "text-slate-700 bg-slate-100 border-slate-200",
};

export function TaskCard({ task, onToggleStatus, onEdit, onDelete }: TaskCardProps) {
  const isCompleted = task.status === "completed";
  const isOverdue = task.due_date && isPastDate(task.due_date) && !isCompleted;

  return (
    <div
      className={`rounded-2xl p-4 border transition-all ${
        isCompleted
          ? "bg-slate-50/75 border-slate-200 opacity-70 shadow-xs"
          : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md shadow-xs"
      } group flex flex-col justify-between gap-3`}
    >
      <div>
        {/* Top meta row */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                priorityConfig[task.priority]
              }`}
            >
              {task.priority}
            </span>

            {task.project && (
              <span
                className="text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1"
                style={{
                  backgroundColor: `${task.project.color}15`,
                  color: task.project.color,
                  border: `1px solid ${task.project.color}30`,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: task.project.color }}
                />
                {task.project.title}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(task)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Edit Task"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Delete Task"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Task Title & Checkbox */}
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => onToggleStatus(task.id, task.status)}
            className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
              isCompleted
                ? "bg-emerald-600 border-emerald-600 text-white"
                : "border-slate-300 bg-white hover:border-indigo-600"
            }`}
          >
            {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </button>

          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-semibold leading-snug break-words ${
                isCompleted ? "line-through text-slate-400" : "text-slate-900"
              }`}
            >
              {task.title}
            </p>
            {task.description && (
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                {task.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          {task.due_date && (
            <span
              className={`flex items-center gap-1 ${
                isOverdue ? "text-rose-600 font-semibold" : "text-slate-500"
              }`}
            >
              <Calendar className="w-3 h-3" />
              {formatDate(task.due_date)} {isOverdue && "(Overdue)"}
            </span>
          )}

          {task.estimated_minutes && (
            <span className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3 h-3" />
              {task.estimated_minutes}m
            </span>
          )}
        </div>

        <span className="text-[10px] text-slate-400 font-medium capitalize">
          {task.status.replace("_", " ")}
        </span>
      </div>
    </div>
  );
}
