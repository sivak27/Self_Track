import { Request, Response, NextFunction } from "express";
import { TaskService } from "../services/task.service.js";
import { createTaskSchema, updateTaskSchema } from "../validators/index.js";

export class TaskController {
  static async getTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tasks = await TaskService.getTasks(req.user!.id, {
        projectId: req.query.projectId as string,
        status: req.query.status as string,
        priority: req.query.priority as string,
        search: req.query.search as string,
      });

      res.json({ success: true, data: tasks });
    } catch (err) {
      next(err);
    }
  }

  static async getTaskById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await TaskService.getTaskById(req.user!.id, req.params.id as string);
      if (!task) {
        res.status(404).json({ success: false, error: "Task not found" });
        return;
      }
      res.json({ success: true, data: task });
    } catch (err) {
      next(err);
    }
  }

  static async createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = createTaskSchema.parse(req.body);
      const task = await TaskService.createTask(req.user!.id, validated);
      res.status(201).json({ success: true, data: task });
    } catch (err) {
      next(err);
    }
  }

  static async updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = updateTaskSchema.parse(req.body);
      const updated = await TaskService.updateTask(
        req.user!.id,
        req.params.id as string,
        validated
      );
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  static async deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await TaskService.deleteTask(req.user!.id, req.params.id as string);
      res.json({ success: true, message: "Task deleted successfully" });
    } catch (err) {
      next(err);
    }
  }
}
