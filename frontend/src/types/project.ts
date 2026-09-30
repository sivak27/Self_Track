export type ProjectStatus = "planning" | "active" | "on_hold" | "completed";
export type PriorityLevel = "low" | "medium" | "high" | "urgent";

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: ProjectStatus;
  priority: PriorityLevel;
  color: string;
  start_date: string | null;
  target_date: string | null;
  created_at: string;
  updated_at: string;
  // Computed stats
  total_tasks?: number;
  completed_tasks?: number;
  progress_pct?: number;
}

export interface CreateProjectInput {
  title: string;
  description?: string | null;
  status?: ProjectStatus;
  priority?: PriorityLevel;
  color?: string;
  start_date?: string | null;
  target_date?: string | null;
}

export interface UpdateProjectInput extends Partial<CreateProjectInput> {}
