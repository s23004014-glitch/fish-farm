import Order from "../models/Order.js";
import Fish from "../models/Fish.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendOrderEmail } from "../utils/sendEmail.js";
import { restoreStock } from "../utils/stock.js";

// POST /api/orders 
// We NEVER trust the price or total from the frontend. We read them from the database.
export const createOrder = asyncHandler(async (req, res) => {
  const { items, delivery, paymentMethod } = req.body;

  // If the same fish is in the list twice, add the quantities
  const wanted = new Map();
  for (const item of items) {
    wanted.set(item.fishId, (wanted.get(item.fishId) || 0) + item.quantity);
  }

  const reserved = []; 
  // stock we already took (so we can give it back on error)
  const orderItems = [];
  let order;

  try {
    for (const [fishId, quantity] of wanted) {
      // One atomic step: reduce stock only if enough stock exists.
      // This stops two buyers taking the last fish at the same time.
      const fish = await Fish.findOneAndUpdate(
        { _id: fishId, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { new: true }
      );

      if (!fish) {
        const exists = await Fish.findById(fishId);
        res.status(exists ? 400 : 404);
        throw new Error(exists ? `Not enough stock for ${exists.name}` : "A fish in your cart was not found");
      }

      reserved.push({ fishId, quantity });
      orderItems.push({
        fish: fish._id,
        name: fish.name,
        price: fish.price, 
        // price from the database
        quantity,
        image: fish.image,
      });
    }

    // Total is calculated on the server
    const total = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount: Math.round(total * 100) / 100,
      delivery,
      paymentMethod,
      paymentStatus: "Pending",
      // Card orders wait for PayHere. COD orders start as Pending.
      orderStatus: paymentMethod === "CARD" ? "Pending Payment" : "Pending",
    });
  } catch (error) {
    // Something failed: give back all the stock we took
    for (const r of reserved) {
      await Fish.updateOne({ _id: r.fishId }, { $inc: { stock: r.quantity } });
    }
    throw error;
  }

  if (paymentMethod === "COD") sendOrderEmail(req.user.email, order);

  res.status(201).json(order);
});

// GET /api/orders/my for buyer
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

// GET /api/orders/:id for owner or admin
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  const isOwner = order.user.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    res.status(403);
    throw new Error("You are not allowed to see this order");
  }
  res.json(order);
});

// PUT /api/orders/:id/cancel by buyer, only if not paid yet. Admin can cancel any order at any time.
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOneAndUpdate(
    {
      _id: req.params.id,
      user: req.user._id, // only own orders
      orderStatus: { $in: ["Pending Payment", "Pending", "Confirmed"] },
      paymentStatus: { $ne: "Paid" },
    },
    { orderStatus: "Cancelled" },
    { new: true }
  );

  if (!order) {
    res.status(400);
    throw new Error("This order cannot be cancelled now. Please contact the farm.");
  }

  await restoreStock(order._id);
  res.json(order);
});

// DELETE /api/orders/:id buyer can delete only their own cancelled or delivered orders. Admin can delete any order at any time.
export const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const isAdmin = req.user.role === "admin";
  const isOwner = order.user.toString() === req.user._id.toString();
  if (!isAdmin && !isOwner) {
    res.status(403);
    throw new Error("You are not allowed to delete this order");
  }

  const finished = ["Cancelled", "Delivered"].includes(order.orderStatus);
  if (!isAdmin && !finished) {
    res.status(400);
    throw new Error("Please cancel the order first, then you can delete it");
  }

  // Deleting an active order gives the stock back
  if (!finished) await restoreStock(order._id);

  await order.deleteOne();
  res.json({ message: "Order deleted" });
});