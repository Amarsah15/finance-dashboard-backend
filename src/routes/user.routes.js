import express from "express";
import {
  getUsers,
  getMe,
  updateUserRole,
  updateUserStatus,
} from "../controllers/user.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect); // All routes require authentication

router.get("/me", getMe);
router.get("/", authorizeRoles("Admin"), getUsers);
router.put("/:id/role", authorizeRoles("Admin"), updateUserRole);
router.put("/:id/status", authorizeRoles("Admin"), updateUserStatus);

export default router;
