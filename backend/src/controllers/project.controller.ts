import { Request, Response, NextFunction } from "express";
import { ProjectService } from "../services/project.service.js";
import { createProjectSchema, updateProjectSchema } from "../validators/index.js";

export class ProjectController {
  static async getProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const projects = await ProjectService.getProjects(req.user!.id);
      res.json({ success: true, data: projects });
    } catch (err) {
      next(err);
    }
  }

  static async getProjectById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const project = await ProjectService.getProjectById(req.user!.id, req.params.id as string);
      if (!project) {
        res.status(404).json({ success: false, error: "Project not found" });
        return;
      }
      res.json({ success: true, data: project });
    } catch (err) {
      next(err);
    }
  }

  static async createProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = createProjectSchema.parse(req.body);
      const project = await ProjectService.createProject(req.user!.id, validated);
      res.status(201).json({ success: true, data: project });
    } catch (err) {
      next(err);
    }
  }

  static async updateProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = updateProjectSchema.parse(req.body);
      const updated = await ProjectService.updateProject(
        req.user!.id,
        req.params.id as string,
        validated
      );
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  static async deleteProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await ProjectService.deleteProject(req.user!.id, req.params.id as string);
      res.json({ success: true, message: "Project deleted successfully" });
    } catch (err) {
      next(err);
    }
  }
}
