import express from "express";
import { getDashboardSummary } from "../controllers/dashboard.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Apply protect middleware - user must be logged in
router.use(protect);

// Allow all valid roles to view the dashboard summary
router.get(
  "/summary",
  authorizeRoles("Viewer", "Analyst", "Admin"),
  getDashboardSummary,
);

export default router;
