// routes/report.route.js
import express from "express";
import { 
  createReportController, 
  getReportsController 
} from "../controllers/report.controller.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

// POST /api/report - Submit a new report (authenticated users only)
router.post("/", auth, createReportController);

// GET /api/report - Get all reports (admin only)
router.get("/", auth, getReportsController);

export default router;