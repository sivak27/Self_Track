import { Router } from "express";
import { TaskController } from "../controllers/task.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/", TaskController.getTasks);
router.post("/", TaskController.createTask);
router.get("/:id", TaskController.getTaskById);
router.put("/:id", TaskController.updateTask);
router.patch("/:id", TaskController.updateTask);
router.delete("/:id", TaskController.deleteTask);

export default router;
