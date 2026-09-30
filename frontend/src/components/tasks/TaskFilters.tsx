import React from "react";
import { Search, Filter } from "lucide-react";
import { TaskFilter, TaskStatus, PriorityLevel } from "@/types/task";
import { Project } from "@/types/project";

interface TaskFiltersProps {
  filters: TaskFilter;
  projects: Project[];
  onChange: (filters: TaskFilter) => void;
  viewMode: "kanban" | "list";
  onToggleView: (mode: "kanban" | "list") => void;
}

export function TaskFilters({
  filters,
  projects,
  onChange,
  viewMode,
  onToggleView,
}: TaskFiltersProps) {
  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200 mb-6 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search tasks..."
          value={filters.search || ""}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-xs"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Project Dropdown */}
        <div className="relative min-w-[150px]">
          <select
            value={filters.projectId || ""}
            onChange={(e) => onChange({ ...filters, projectId: e.target.value || undefined })}
            className="w-full appearance-none pl-3 pr-8 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-xs"
          >
            <option value="">All Projects</option>
            {projects.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.title}
              </option>
            ))}
          </select>
          <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
        </div>

        {/* Priority Filter */}
        <select
          value={filters.priority || ""}
          onChange={(e) => onChange({ ...filters, priority: (e.target.value as PriorityLevel) || undefined })}
          className="py-2 px-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-xs"
        >
          <option value="">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        {/* Status Filter (only shown in list mode) */}
        {viewMode === "list" && (
          <select
            value={filters.status || ""}
            onChange={(e) => onChange({ ...filters, status: (e.target.value as TaskStatus) || undefined })}
            className="py-2 px-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-xs"
          >
            <option value="">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
          </select>
        )}

        {/* View Mode Toggle */}
        <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            onClick={() => onToggleView("kanban")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              viewMode === "kanban"
                ? "bg-white text-indigo-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Board
          </button>
          <button
            onClick={() => onToggleView("list")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              viewMode === "list"
                ? "bg-white text-indigo-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            List
          </button>
        </div>
      </div>
    </div>
  );
}
