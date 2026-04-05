import express from "express";
import { createRecord, getRecords, deleteRecord, updateRecord } from '../controllers/record.controller.js';
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";
import {
  validate,
  recordValidationSchema,
} from "../middlewares/validate.middleware.js";


const router = express.Router();

// Apply protect middleware to all routes in this file (must be logged in)
router.use(protect);

// GET is allowed for Admin and Analyst
router.get("/", authorizeRoles("Admin", "Analyst"), getRecords);

// POST requires Admin role AND passes through Zod validation
router.post(
  "/",
  authorizeRoles("Admin"),
  validate(recordValidationSchema),
  createRecord,
);

// DELETE requires Admin role
router.delete("/:id", authorizeRoles("Admin"), deleteRecord);

// PUT requires Admin role
router.put('/:id', authorizeRoles('Admin'), validate(recordValidationSchema), updateRecord);

export default router;
