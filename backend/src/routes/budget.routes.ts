import { Router } from "express";
import { BudgetController } from "../controllers/budget.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/", BudgetController.getBudgets);
router.post("/", BudgetController.createBudget);
router.get("/:id", BudgetController.getBudgetById);
router.put("/:id", BudgetController.updateBudget);
router.patch("/:id", BudgetController.updateBudget);
router.delete("/:id", BudgetController.deleteBudget);

export default router;
