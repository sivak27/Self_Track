import { Request, Response, NextFunction } from "express";
import { GoalService } from "../services/goal.service.js";
import { createGoalSchema, updateGoalSchema } from "../validators/index.js";

export class GoalController {
  static async getGoals(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const goals = await GoalService.getGoals(req.user!.id);
      res.json({ success: true, data: goals });
    } catch (err) {
      next(err);
    }
  }

  static async getGoalById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const goal = await GoalService.getGoalById(req.user!.id, req.params.id as string);
      if (!goal) {
        res.status(404).json({ success: false, error: "Goal not found" });
        return;
      }
      res.json({ success: true, data: goal });
    } catch (err) {
      next(err);
    }
  }

  static async createGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = createGoalSchema.parse(req.body);
      const goal = await GoalService.createGoal(req.user!.id, validated);
      res.status(201).json({ success: true, data: goal });
    } catch (err) {
      next(err);
    }
  }

  static async updateGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = updateGoalSchema.parse(req.body);
      const updated = await GoalService.updateGoal(
        req.user!.id,
        req.params.id as string,
        validated
      );
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  static async incrementGoalProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const delta = Number(req.body.delta) || 0;
      const updated = await GoalService.incrementGoalProgress(
        req.user!.id,
        req.params.id as string,
        delta
      );
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  static async deleteGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await GoalService.deleteGoal(req.user!.id, req.params.id as string);
      res.json({ success: true, message: "Goal deleted successfully" });
    } catch (err) {
      next(err);
    }
  }
}
