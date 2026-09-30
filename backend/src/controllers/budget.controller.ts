import { Request, Response, NextFunction } from "express";
import { BudgetService } from "../services/budget.service.js";
import { createBudgetSchema, updateBudgetSchema } from "../validators/index.js";

export class BudgetController {
  static async getBudgets(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const budgets = await BudgetService.getBudgets(req.user!.id);
      res.json({ success: true, data: budgets });
    } catch (err) {
      next(err);
    }
  }

  static async getBudgetById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const budget = await BudgetService.getBudgetById(req.user!.id, req.params.id as string);
      if (!budget) {
        res.status(404).json({ success: false, error: "Budget not found" });
        return;
      }
      res.json({ success: true, data: budget });
    } catch (err) {
      next(err);
    }
  }

  static async createBudget(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = createBudgetSchema.parse(req.body);
      const budget = await BudgetService.createBudget(req.user!.id, validated);
      res.status(201).json({ success: true, data: budget });
    } catch (err) {
      next(err);
    }
  }

  static async updateBudget(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = updateBudgetSchema.parse(req.body);
      const updated = await BudgetService.updateBudget(
        req.user!.id,
        req.params.id as string,
        validated
      );
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  static async deleteBudget(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await BudgetService.deleteBudget(req.user!.id, req.params.id as string);
      res.json({ success: true, message: "Budget deleted successfully" });
    } catch (err) {
      next(err);
    }
  }
}
