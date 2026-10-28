import mongoose from "mongoose";

const LOW_STOCK_LIMIT = 5;

const fishSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Fish name is required"], trim: true, maxlength: 60 },
    price: { type: Number, required: [true, "Price is required"], min: 0 }, // LKR
    size: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    careTips: { type: String, trim: true, default: "" },
    stock: { type: Number, required: true, min: 0, default: 0 },
    image: { type: String, default: "" }, // image upload
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Extra field for the frontend check the stock: "In stock", "Low stock" or "Out of stock"
fishSchema.virtual("stockStatus").get(function () {
  if (this.stock <= 0) return "Out of stock";
  if (this.stock <= LOW_STOCK_LIMIT) return "Low stock";
  return "In stock";
});

export default mongoose.model("Fish", fishSchema);