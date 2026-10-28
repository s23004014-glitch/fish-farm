import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  deleteOrder,
} from "../controllers/orderController.js";
import { protect, buyerOnly } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { orderSchema } from "../utils/schemas.js";

const router = express.Router();

router.use(protect); 
// every order route needs login

router.post("/", buyerOnly, validate(orderSchema), createOrder);
router.get("/my", buyerOnly, getMyOrders); 
router.get("/:id", getOrderById); 
// owner or admin (checked inside)
router.put("/:id/cancel", buyerOnly, cancelOrder);
router.delete("/:id", deleteOrder); 
// buyer own, or admin (checked inside)

export default router;