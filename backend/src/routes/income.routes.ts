import { Router } from "express";
import { IncomeController } from "../controllers/income.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/sources", IncomeController.getSources);
router.post("/sources", IncomeController.createSource);

router.get("/", IncomeController.getIncome);
router.post("/", IncomeController.createIncome);
router.get("/:id", IncomeController.getIncomeById);
router.put("/:id", IncomeController.updateIncome);
router.patch("/:id", IncomeController.updateIncome);
router.delete("/:id", IncomeController.deleteIncome);

export default router;
