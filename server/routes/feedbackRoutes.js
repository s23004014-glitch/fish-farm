import express from "express";
import { getFeedback, createFeedback } from "../controllers/feedbackController.js";
import validate from "../middleware/validate.js";
import { formLimiter } from "../middleware/rateLimiter.js";
import { feedbackSchema } from "../utils/schemas.js";

const router = express.Router();

router.get("/", getFeedback);
router.post("/", formLimiter, validate(feedbackSchema), createFeedback);

export default router;