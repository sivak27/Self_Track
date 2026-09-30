import { Request, Response, NextFunction } from "express";
import { ExpenseService } from "../services/expense.service.js";
import {
  createExpenseSchema,
  updateExpenseSchema,
  createExpenseCategorySchema,
} from "../validators/index.js";

export class ExpenseController {
  static async getExpenses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const expenses = await ExpenseService.getExpenses(req.user!.id, {
        search: req.query.search as string,
        categoryId: req.query.categoryId as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        paymentMethod: req.query.paymentMethod as string,
      });

      res.json({ success: true, data: expenses });
    } catch (err) {
      next(err);
    }
  }

  static async getExpenseById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const expense = await ExpenseService.getExpenseById(
        req.user!.id,
        req.params.id as string
      );

      if (!expense) {
        res.status(404).json({ success: false, error: "Expense not found" });
        return;
      }

      res.json({ success: true, data: expense });
    } catch (err) {
      next(err);
    }
  }

  static async createExpense(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = createExpenseSchema.parse(req.body);
      const created = await ExpenseService.createExpense(
        req.user!.id,
        validated
      );

      res.status(201).json({ success: true, data: created });
    } catch (err) {
      next(err);
    }
  }

  static async updateExpense(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = updateExpenseSchema.parse(req.body);
      const updated = await ExpenseService.updateExpense(
        req.user!.id,
        req.params.id as string,
        validated
      );

      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  static async deleteExpense(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await ExpenseService.deleteExpense(req.user!.id, req.params.id as string);
      res.json({ success: true, message: "Expense deleted successfully" });
    } catch (err) {
      next(err);
    }
  }

  static async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await ExpenseService.getCategories(req.user!.id);
      res.json({ success: true, data: categories });
    } catch (err) {
      next(err);
    }
  }

  static async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = createExpenseCategorySchema.parse(req.body);
      const category = await ExpenseService.createCategory(
        req.user!.id,
        validated
      );

      res.status(201).json({ success: true, data: category });
    } catch (err) {
      next(err);
    }
  }
}
