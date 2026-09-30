"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Edit2, Trash2, Calendar, CheckSquare } from "lucide-react";
import { Project } from "@/types/project";
import { formatDate } from "@/lib/utils/date";

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

const priorityStyles = {
  low: "text-slate-600 bg-slate-100 border-slate-200",
  medium: "text-indigo-700 bg-indigo-50 border-indigo-200",
  high: "text-amber-700 bg-amber-50 border-amber-200",
  urgent: "text-rose-700 bg-rose-50 border-rose-200",
};

const statusStyles = {
  planning: "text-purple-700 bg-purple-50 border-purple-200",
  active: "text-indigo-700 bg-indigo-50 border-indigo-200",
  on_hold: "text-amber-700 bg-amber-50 border-amber-200",
  completed: "text-emerald-700 bg-emerald-50 border-emerald-200",
};

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const progress = project.progress_pct || 0;
  const totalTasks = project.total_tasks || 0;
  const completedTasks = project.completed_tasks || 0;

  return (
    <div className="rounded-2xl p-5 border border-slate-200 bg-white shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group">
      <div>
        {/* Top Badges & Actions */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                statusStyles[project.status]
              }`}
            >
              {project.status.replace("_", " ")}
            </span>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                priorityStyles[project.priority]
              }`}
            >
              {project.priority}
            </span>
          </div>

          <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(project)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Edit Project"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(project.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Delete Project"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Title & Description */}
        <div className="flex items-center gap-2.5 mb-2">
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: project.color }}
          />
          <h3 className="text-base font-bold text-slate-900 tracking-tight line-clamp-1">
            {project.title}
          </h3>
        </div>

        {project.description && (
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
            {project.description}
          </p>
        )}

        {/* Dates */}
        {project.target_date && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            <span>Target: {formatDate(project.target_date)}</span>
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Milestone Progress</span>
            <span className="font-mono font-semibold text-indigo-600">{progress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer link to tasks */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500 flex items-center gap-1.5">
          <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
          {completedTasks}/{totalTasks} tasks completed
        </span>

        <Link
          to={`/tasks?projectId=${project.id}`}
          className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
        >
          View Tasks →
        </Link>
      </div>
    </div>
  );
}
