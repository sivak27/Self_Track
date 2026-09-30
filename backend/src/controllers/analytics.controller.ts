import { Request, Response, NextFunction } from "express";
import { AnalyticsService } from "../services/analytics.service.js";

export class AnalyticsController {
  static async getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await AnalyticsService.getAnalytics(req.user!.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await AnalyticsService.getDashboardMetrics(req.user!.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async getExpenses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await AnalyticsService.getExpenseAnalytics(req.user!.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async getIncome(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await AnalyticsService.getIncomeAnalytics(req.user!.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await AnalyticsService.getAnalytics(req.user!.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}
