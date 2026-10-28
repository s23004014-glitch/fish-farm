import Order from "../models/Order.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendOrderEmail } from "../utils/sendEmail.js";
import { restoreStock } from "../utils/stock.js";
import { makePayhereHash, makeNotifySig, safeEqual, checkoutUrl } from "../utils/payhere.js";

// POST /api/payments/payhere/start   (buyer)
// Gives the frontend everything it needs to open PayHere checkout.
export const startPayhere = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.body.orderId, user: req.user._id });
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  if (
    order.paymentMethod !== "CARD" ||
    order.paymentStatus !== "Pending" ||
    order.orderStatus !== "Pending Payment"
  ) {
    res.status(400);
    throw new Error("This order cannot be paid online");
  }

  const orderId = order._id.toString();
  const amount = order.totalAmount.toFixed(2); 
  // PayHere needs 2 decimals
  const [firstName, ...rest] = order.delivery.name.split(" ");

  const fields = {
    merchant_id: process.env.PAYHERE_MERCHANT_ID,
    return_url: `${process.env.CLIENT_URL}/payment/result?order_id=${orderId}`,
    cancel_url: `${process.env.CLIENT_URL}/payment/result?order_id=${orderId}&cancelled=1`,
    notify_url: `${process.env.SERVER_URL}/api/payments/payhere/notify`,
    order_id: orderId,
    items: order.items.map((i) => `${i.name} x${i.quantity}`).join(", ").slice(0, 200),
    currency: "LKR",
    amount,
    first_name: firstName,
    last_name: rest.join(" ") || "-",
    email: req.user.email,
    phone: order.delivery.phone,
    address: order.delivery.address,
    city: "Colombo", 
    // PayHere needs a city. We do not collect one, so this is a fixed value.
    country: "Sri Lanka",
    hash: makePayhereHash(orderId, amount, "LKR"),
  };

  res.json({ checkoutUrl: checkoutUrl(), fields });
});

// POST /api/payments/payhere/notify   (called by PayHere servers, not by users)
// We trust nothing until the signature, amount and currency are checked.
export const payhereNotify = asyncHandler(async (req, res) => {
  const { merchant_id, order_id, payment_id, payhere_amount, payhere_currency, status_code, md5sig } = req.body;

  // 1. All needed fields must exist
  if (!merchant_id || !order_id || !payhere_amount || !payhere_currency || status_code === undefined || !md5sig) {
    return res.status(400).send("Bad request");
  }

  // 2. Must be our merchant, and the signature must match
  const expected = makeNotifySig({ merchant_id, order_id, payhere_amount, payhere_currency, status_code });
  if (merchant_id !== process.env.PAYHERE_MERCHANT_ID || !safeEqual(expected, String(md5sig).toUpperCase())) {
    console.error("PayHere notify: bad signature");
    return res.status(400).send("Invalid signature");
  }

  // 3. Find the order
  if (!/^[0-9a-fA-F]{24}$/.test(order_id)) return res.status(400).send("Bad order id");
  const order = await Order.findById(order_id);
  if (!order) return res.status(404).send("Order not found");

  // 4. Amount and currency must match our own order
  if (payhere_currency !== "LKR" || Number(payhere_amount).toFixed(2) !== order.totalAmount.toFixed(2)) {
    console.error("PayHere notify: amount or currency mismatch, order", order_id);
    return res.status(400).send("Amount mismatch");
  }

  const code = Number(status_code);

  if (code === 2) {
    // SUCCESS. This update works only once (stops double processing).
    const paid = await Order.findOneAndUpdate(
      { _id: order_id, paymentStatus: { $ne: "Paid" }, orderStatus: "Pending Payment" },
      { paymentStatus: "Paid", orderStatus: "Pending", payherePaymentId: payment_id, paidAt: new Date() },
      { new: true }
    );

    if (paid) {
      const user = await User.findById(paid.user);
      if (user) sendOrderEmail(user.email, paid);
    } else if (order.orderStatus === "Cancelled") {
      // Rare: buyer cancelled while paying. Admin must refund by hand.
      console.error("Payment received for a CANCELLED order. Refund needed. Order:", order_id);
    }
  } else if (code < 0) {
    // FAILED before we marked it paid
    const failed = await Order.findOneAndUpdate(
      { _id: order_id, paymentStatus: "Pending", orderStatus: "Pending Payment" },
      { paymentStatus: "Failed", orderStatus: "Cancelled" },
      { new: true }
    );
    if (failed) await restoreStock(failed._id);
  }

  res.status(200).send("OK");
});