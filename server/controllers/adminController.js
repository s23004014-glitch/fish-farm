import Order from "../models/Order.js";
import Fish from "../models/Fish.js";
import User from "../models/User.js";
import Request from "../models/Request.js";
import Feedback from "../models/Feedback.js";
import asyncHandler from "../utils/asyncHandler.js";
import { restoreStock } from "../utils/stock.js";

// GET /api/admin/stats
export const getStats = asyncHandler(async (req, res) => {
  const [totalOrders, pendingOrders, revenue, lowStockFish, totalBuyers, openRequests] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ orderStatus: "Pending" }),
    Order.aggregate([
      { $match: { paymentStatus: "Paid", orderStatus: { $ne: "Cancelled" } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
    Fish.find({ stock: { $lte: 5 } }).select("name stock").sort({ stock: 1 }),
    User.countDocuments({ role: "buyer" }),
    Request.countDocuments({ status: "Open" }),
  ]);

  res.json({
    totalOrders,
    pendingOrders,
    totalRevenue: revenue[0] ? revenue[0].total : 0,
    lowStockFish,
    totalBuyers,
    openRequests,
  });
});

// GET /api/admin/orders
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().populate("user", "name email phone").sort({ createdAt: -1 });
  res.json(orders);
});

// PUT /api/admin/orders/:id/status
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const { status } = req.body;

  if (["Cancelled", "Delivered"].includes(order.orderStatus)) {
    res.status(400);
    throw new Error(`A ${order.orderStatus.toLowerCase()} order cannot be changed`);
  }
  if (order.orderStatus === "Pending Payment" && status !== "Cancelled") {
    res.status(400);
    throw new Error("This order is waiting for the card payment");
  }

  order.orderStatus = status;
  await order.save();

  //Order cancelled by admin
  if (status === "Cancelled") await restoreStock(order._id);

  res.json(order);
});

// PUT /api/admin/orders/:id/paid -> for Cash on Delivery orders
export const markOrderPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  if (order.paymentMethod !== "COD") {
    res.status(400);
    throw new Error("Only Cash on Delivery orders can be marked paid by hand");
  }
  if (order.orderStatus === "Cancelled") {
    res.status(400);
    throw new Error("This order is cancelled");
  }

  order.paymentStatus = "Paid";
  order.paidAt = new Date();
  await order.save();
  res.json(order);
});

// GET /api/admin/buyers
export const getBuyers = asyncHandler(async (req, res) => {
  const buyers = await User.find({ role: "buyer" }).sort({ createdAt: -1 });
  res.json(buyers);
});

// API  GET /api/admin/requests
export const getAllRequests = asyncHandler(async (req, res) => {
  const requests = await Request.find().populate("user", "name email").sort({ createdAt: -1 });
  res.json(requests);
});

// API PUT (mean update) 
export const resolveRequest = asyncHandler(async (req, res) => {
  const request = await Request.findByIdAndUpdate(req.params.id, { status: "Resolved" }, { new: true });
  if (!request) {
    res.status(404);
    throw new Error("Request not found");
  }
  res.json(request);
});

// for feedback delete
export const deleteFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findByIdAndDelete(req.params.id);
  if (!feedback) {
    res.status(404);
    throw new Error("Feedback not found");
  }
  res.json({ message: "Feedback deleted" });
});