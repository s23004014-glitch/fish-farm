import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    fish: { type: mongoose.Schema.Types.ObjectId, ref: "Fish", required: true },
    //we copy name, price and image so old orders never change
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, default: "" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: { type: [orderItemSchema], required: true },
    totalAmount: { type: Number, required: true },
    delivery: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      address: { type: String, required: true, trim: true },
    },
    paymentMethod: { type: String, enum: ["COD", "CARD"], required: true },
    paymentStatus: { type: String, enum: ["Pending", "Paid", "Failed"], default: "Pending" },
    orderStatus: {
      type: String,
      enum: ["Pending Payment", "Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    // PayHere details (we never store card details)
    payherePaymentId: { type: String },
    paidAt: { type: Date },
    // Stops us from giving the stock back twice
    stockRestored: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);