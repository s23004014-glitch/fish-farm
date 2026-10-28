import Order from "../models/Order.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendOrderEmail } from "../utils/sendEmail.js";
import { charge } from "../utils/mockGateway.js";

// catches typing mistakes in card numbers
const luhnOk = (digits) => {
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
};

// POST /api/payments/test-card/pay   (buyer, demo only)
// The card number and CVV are used only inside this request. They are never saved,
// logged or sent back.
export const payWithTestCard = asyncHandler(async (req, res) => {
  const { orderId, cardNumber, expiry } = req.body;

  // 1. Basic card checks
  if (!luhnOk(cardNumber)) {
    res.status(400);
    throw new Error("Card number is not valid");
  }
  const [mm, yy] = expiry.split("/").map(Number);
  if (new Date(2000 + yy, mm, 0, 23, 59, 59) < new Date()) {
    res.status(400);
    throw new Error("This card has expired");
  }

  // 2. The order must be ours and still waiting for payment -> checked BEFORE charging
  const order = await Order.findOne({ _id: orderId, user: req.user._id });
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  if (order.paymentMethod !== "CARD" || order.paymentStatus !== "Pending" || order.orderStatus !== "Pending Payment") {
    res.status(400);
    throw new Error("This order cannot be paid");
  }

  // 3. Charge the amount saved in OUR database (never an amount from the browser)
  const result = await charge({ cardNumber });
  if (!result.approved) {
    res.status(402);
    throw new Error(result.reason);
  }

  // 4. Mark paid. only one can succeed, if the order was already paid it's ok
  const paid = await Order.findOneAndUpdate(
    { _id: order._id, paymentStatus: "Pending", orderStatus: "Pending Payment" },
    { paymentStatus: "Paid", orderStatus: "Pending", payherePaymentId: result.paymentId, paidAt: new Date() },
    { new: true }
  );
  if (!paid) {
    res.status(409);
    throw new Error("This order was already processed");
  }

  const user = await User.findById(paid.user);
  if (user) sendOrderEmail(user.email, paid);

  // Only the brand and the last 4 digits go back
  res.json({ message: "Payment approved", brand: result.brand, last4: result.last4 });
});