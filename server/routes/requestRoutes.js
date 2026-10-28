import express from "express";
import { createRequest, getMyRequests } from "../controllers/requestController.js";
import { protect, buyerOnly, optionalAuth } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { formLimiter } from "../middleware/rateLimiter.js";
import { requestSchema } from "../utils/schemas.js";

const router = express.Router();

router.post("/", formLimiter, optionalAuth, validate(requestSchema), createRequest);
router.get("/my", protect, buyerOnly, getMyRequests);

export default router;