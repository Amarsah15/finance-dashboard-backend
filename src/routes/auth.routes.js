import express from "express";
import { registerUser, loginUser } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  registerValidationSchema,
  loginValidationSchema,
} from "../middlewares/validate.middleware.js";

const router = express.Router();

router.post("/register", validate(registerValidationSchema), registerUser);
router.post("/login", validate(loginValidationSchema), loginUser);

export default router;
