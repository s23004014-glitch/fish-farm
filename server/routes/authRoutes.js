import express from "express";
import { register, login, googleLogin, logout, getMe } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { registerSchema, loginSchema, googleSchema } from "../utils/schemas.js";
const router = express.Router();

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/google", authLimiter, validate(googleSchema), googleLogin);
router.post("/logout", logout);
router.get("/me", protect, getMe);

export default router;