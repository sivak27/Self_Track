import { Router } from "express";
import { GoalController } from "../controllers/goal.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/", GoalController.getGoals);
router.post("/", GoalController.createGoal);
router.get("/:id", GoalController.getGoalById);
router.put("/:id", GoalController.updateGoal);
router.patch("/:id", GoalController.updateGoal);
router.post("/:id/increment", GoalController.incrementGoalProgress);
router.delete("/:id", GoalController.deleteGoal);

export default router;
