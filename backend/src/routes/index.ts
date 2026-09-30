import { Router } from "express";
import authRoutes from "./auth.routes.js";
import expenseRoutes from "./expense.routes.js";
import incomeRoutes from "./income.routes.js";
import budgetRoutes from "./budget.routes.js";
import taskRoutes from "./task.routes.js";
import projectRoutes from "./project.routes.js";
import goalRoutes from "./goal.routes.js";
import analyticsRoutes from "./analytics.routes.js";
import settingsRoutes from "./settings.routes.js";
import { AnalyticsController } from "../controllers/analytics.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const apiRouter = Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/expenses", expenseRoutes);
apiRouter.use("/income", incomeRoutes);
apiRouter.use("/budgets", budgetRoutes);
apiRouter.use("/tasks", taskRoutes);
apiRouter.use("/projects", projectRoutes);
apiRouter.use("/goals", goalRoutes);
apiRouter.use("/analytics", analyticsRoutes);
apiRouter.use("/settings", settingsRoutes);
apiRouter.get("/health", (req, res) => {
  res.json({
    status: "ok",
  });
});
apiRouter.get("/dashboard", requireAuth, AnalyticsController.getDashboard);

export default apiRouter;
