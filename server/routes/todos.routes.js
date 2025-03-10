import { Router } from "express";
import { todosController } from "../controllers/todos.controller.js";

const router = Router();

router.post("/", todosController);

export default router;
