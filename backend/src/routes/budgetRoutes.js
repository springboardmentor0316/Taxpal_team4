// src/routes/budgetRoutes.js
import express from "express";
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} from "../controllers/budgetController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes protected so user must be logged-in (JWT)
router.get("/", protect, getBudgets);
router.post("/", protect, createBudget);
router.put("/:id", protect, updateBudget);
router.delete("/:id", protect, deleteBudget);

export default router;
