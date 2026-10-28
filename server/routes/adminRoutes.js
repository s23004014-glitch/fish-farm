import express from "express";
import {
  getStats,
  getAllOrders,
  updateOrderStatus,
  markOrderPaid,
  getBuyers,
  getAllRequests,
  resolveRequest,
  deleteFeedback,
} from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { orderStatusSchema } from "../utils/schemas.js";

const router = express.Router();

// Every admin route needs login AND the admin role
router.use(protect, adminOnly);

router.get("/stats", getStats);
router.get("/orders", getAllOrders);
router.put("/orders/:id/status", validate(orderStatusSchema), updateOrderStatus);
router.put("/orders/:id/paid", markOrderPaid);
router.get("/buyers", getBuyers);
router.get("/requests", getAllRequests);
router.put("/requests/:id/resolve", resolveRequest);
router.delete("/feedback/:id", deleteFeedback);

export default router;