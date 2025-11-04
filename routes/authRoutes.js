// routes/auth.js
import express from "express";
import { authenticate } from "../middleware/auth.js";
import { registerValidator, loginValidator } from "../middleware/validation.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword,
} from "../controllers/authController.js";

const router = express.Router();

// Public routes
router.post("/register", authLimiter, registerValidator, asyncHandler(registerUser));
router.post("/login", authLimiter, loginValidator, asyncHandler(loginUser));

// Private routes
router.get("/me", authenticate, asyncHandler(getProfile));
router.put("/profile", authenticate, asyncHandler(updateProfile));
router.put("/change-password", authenticate, asyncHandler(changePassword));

export default router;
