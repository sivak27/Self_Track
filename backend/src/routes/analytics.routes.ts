import { Router } from "express";
import { AnalyticsController } from "../controllers/analytics.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/", AnalyticsController.getAnalytics);
router.get("/dashboard", AnalyticsController.getDashboard);
router.get("/summary", AnalyticsController.getSummary);
router.get("/expenses", AnalyticsController.getExpenses);
router.get("/income", AnalyticsController.getIncome);

export default router;
