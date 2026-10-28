import express from "express";
import { sendContact } from "../controllers/contactController.js";
import validate from "../middleware/validate.js";
import { formLimiter } from "../middleware/rateLimiter.js";
import { requestSchema } from "../utils/schemas.js"; // same fields: name, email, subject, message

const router = express.Router();

router.post("/", formLimiter, validate(requestSchema), sendContact);

export default router;