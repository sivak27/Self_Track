import { Request, Response, NextFunction } from "express";
import { SettingsService } from "../services/settings.service.js";
import { updateSettingsSchema } from "../validators/index.js";

export class SettingsController {
  static async getSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const settings = await SettingsService.getSettings(req.user!.id);
      res.json({ success: true, data: settings });
    } catch (err) {
      next(err);
    }
  }

  static async updateSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = updateSettingsSchema.parse(req.body);
      const updated = await SettingsService.updateSettings(
        req.user!.id,
        validated
      );

      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  static async exportData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const archive = await SettingsService.exportAllData(req.user!.id);

      res.setHeader("Content-Disposition", 'attachment; filename="personal-control-center-backup.json"');
      res.setHeader("Content-Type", "application/json");
      res.json({ success: true, data: archive });
    } catch (err) {
      next(err);
    }
  }
}
