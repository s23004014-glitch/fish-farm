import express from "express";
import { startPayhere, payhereNotify } from "../controllers/paymentController.js";
import { payWithTestCard } from "../controllers/cardController.js";
import { protect, buyerOnly } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { cardLimiter } from "../middleware/rateLimiter.js";
import { orderIdSchema, testCardSchema } from "../utils/schemas.js";

const router = express.Router();

// Demo route -> works only when ENABLE_TEST_CARD=true and NEVER in production
const demoOnly = (req, res, next) => {
  if (process.env.ENABLE_TEST_CARD !== "true" || process.env.NODE_ENV === "production") {
    return res.status(404).json({ message: "Not found" });
  }
  next();
};

// Tell browsers and proxies never to keep this response
const noStore = (req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
};

router.post("/payhere/start", protect, buyerOnly, validate(orderIdSchema), startPayhere);

// No login here: PayHere calls this. Safety comes from the md5sig check.

router.post("/payhere/notify", payhereNotify);

router.post("/test-card/pay", demoOnly, protect, buyerOnly, noStore, cardLimiter, validate(testCardSchema), payWithTestCard);

export default router;