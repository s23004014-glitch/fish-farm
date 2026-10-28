import express from "express";
import { getProfile, updateProfile, changePassword } from "../controllers/userController.js";
import { protect, buyerOnly } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { profileSchema, changePasswordSchema } from "../utils/schemas.js";

const router = express.Router();

router.use(protect, buyerOnly);

router.get("/profile", getProfile);
router.put("/profile", validate(profileSchema), updateProfile);
router.put("/change-password", authLimiter, validate(changePasswordSchema), changePassword);

export default router;