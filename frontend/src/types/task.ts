import { PriorityLevel, Project } from "./project";

export type { PriorityLevel };
export type TaskStatus = "todo" | "in_progress" | "review" | "completed";

export interface Task {
  id: string;
  user_id: string;
  project_id: string | null;
  goal_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: PriorityLevel;
  due_date: string | null;
  estimated_minutes: number | null;
  actual_minutes: number | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  project?: Project | null;
}

export interface CreateTaskInput {
  project_id?: string | null;
  goal_id?: string | null;
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: PriorityLevel;
  due_date?: string | null;
  estimated_minutes?: number | null;
  actual_minutes?: number | null;
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  completed_at?: string | null;
}

export interface TaskFilter {
  status?: TaskStatus;
  priority?: PriorityLevel;
  projectId?: string;
  dueDate?: string;
  search?: string;
}

export type TaskFilters = TaskFilter;

