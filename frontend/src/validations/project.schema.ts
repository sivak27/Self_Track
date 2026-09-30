import { z } from "zod";

export const baseProjectSchema = z.object({
  title: z.string().min(1, "Project title is required").max(100, "Title is too long"),
  description: z.string().max(500, "Description is too long").nullable().optional(),
  status: z.enum(["planning", "active", "on_hold", "completed"]).default("active"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  color: z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, "Invalid color hex format").default("#06B6D4"),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").nullable().optional(),
  target_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").nullable().optional(),
});

export const createProjectSchema = baseProjectSchema.refine(
  (data) => {
    if (data.start_date && data.target_date) {
      return new Date(data.start_date) <= new Date(data.target_date);
    }
    return true;
  },
  {
    message: "Start date must be before or equal to target date",
    path: ["target_date"],
  }
);

export const updateProjectSchema = baseProjectSchema.partial();

export type CreateProjectDto = z.infer<typeof createProjectSchema>;
export type UpdateProjectDto = z.infer<typeof updateProjectSchema>;
