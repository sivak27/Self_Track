import { Request, Response, NextFunction } from "express";
import { IncomeService } from "../services/income.service.js";
import {
  createIncomeSchema,
  updateIncomeSchema,
  createIncomeSourceSchema,
} from "../validators/index.js";

export class IncomeController {
  static async getIncome(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const income = await IncomeService.getIncome(req.user!.id, {
        search: req.query.search as string,
        sourceId: (req.query.sourceId || req.query.source_id) as string,
        income_source: (req.query.income_source || req.query.incomeSource || req.query.source) as string,
        deposit_status: (req.query.deposit_status || req.query.depositStatus || req.query.status) as string,
        startDate: (req.query.startDate || req.query.start_date) as string,
        endDate: (req.query.endDate || req.query.end_date) as string,
      });

      res.json({ success: true, data: income });
    } catch (err) {
      next(err);
    }
  }

  static async getIncomeById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const income = await IncomeService.getIncomeById(
        req.user!.id,
        req.params.id as string
      );

      if (!income) {
        res.status(404).json({ success: false, error: "Income not found" });
        return;
      }

      res.json({ success: true, data: income });
    } catch (err) {
      next(err);
    }
  }

  static async createIncome(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = createIncomeSchema.parse(req.body);
      const created = await IncomeService.createIncome(
        req.user!.id,
        validated
      );

      res.status(201).json({ success: true, data: created });
    } catch (err) {
      next(err);
    }
  }

  static async updateIncome(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = updateIncomeSchema.parse(req.body);
      const updated = await IncomeService.updateIncome(
        req.user!.id,
        req.params.id as string,
        validated
      );

      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  static async deleteIncome(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await IncomeService.deleteIncome(req.user!.id, req.params.id as string);
      res.json({ success: true, message: "Income deleted successfully" });
    } catch (err) {
      next(err);
    }
  }

  static async getSources(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sources = await IncomeService.getSources(req.user!.id);
      res.json({ success: true, data: sources });
    } catch (err) {
      next(err);
    }
  }

  static async createSource(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = createIncomeSourceSchema.parse(req.body);
      const source = await IncomeService.createSource(
        req.user!.id,
        validated
      );

      res.status(201).json({ success: true, data: source });
    } catch (err) {
      next(err);
    }
  }
}
