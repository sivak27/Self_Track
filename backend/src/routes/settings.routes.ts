import { Router } from "express";
import { SettingsController } from "../controllers/settings.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/", SettingsController.getSettings);
router.put("/", SettingsController.updateSettings);
router.patch("/", SettingsController.updateSettings);
router.get("/export", SettingsController.exportData);

export default router;
