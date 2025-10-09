// src/routes/reportRoutes.js
import express from "express";
import { listReports, generateReport, deleteReport, previewReport } from "../controllers/reportController.js";

const router = express.Router();

router.get("/", listReports);
router.post("/generate", generateReport);
router.delete("/:id", deleteReport);

// preview route for iframe: serves HTML preview (CSV -> table, PDF -> embedded)
router.get("/:id/preview", previewReport);

export default router;
