import { Router } from "express";
import { ExpenseController } from "../controllers/expense.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/categories", ExpenseController.getCategories);
router.post("/categories", ExpenseController.createCategory);

router.get("/", ExpenseController.getExpenses);
router.post("/", ExpenseController.createExpense);
router.get("/:id", ExpenseController.getExpenseById);
router.put("/:id", ExpenseController.updateExpense);
router.patch("/:id", ExpenseController.updateExpense);
router.delete("/:id", ExpenseController.deleteExpense);

export default router;
