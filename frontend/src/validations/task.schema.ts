import { z } from "zod";

export const createTaskSchema = z.object({
  project_id: z.string().uuid("Invalid project ID").nullable().optional(),
  goal_id: z.string().uuid("Invalid goal ID").nullable().optional(),
  title: z.string().min(1, "Task title is required").max(150, "Title is too long"),
  description: z.string().max(1000, "Description is too long").nullable().optional(),
  status: z.enum(["todo", "in_progress", "review", "completed"]).default("todo"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").nullable().optional(),
  estimated_minutes: z.number().int().min(0).nullable().optional(),
  actual_minutes: z.number().int().min(0).nullable().optional(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  completed_at: z.string().nullable().optional(),
});

export const taskFilterSchema = z.object({
  status: z.enum(["todo", "in_progress", "review", "completed"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  projectId: z.string().optional(),
  dueDate: z.string().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});

export type CreateTaskDto = z.infer<typeof createTaskSchema>;
export type UpdateTaskDto = z.infer<typeof updateTaskSchema>;
