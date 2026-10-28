import Fish from "../models/Fish.js";
import Order from "../models/Order.js";

export const restoreStock = async (orderId) => {
  // This update works only if stockRestored is false, so it runs once
  const order = await Order.findOneAndUpdate(
    { _id: orderId, stockRestored: false },
    { stockRestored: true },
    { new: true }
  );
  if (!order) return;

  for (const item of order.items) {
    await Fish.updateOne({ _id: item.fish }, { $inc: { stock: item.quantity } });
  }
};