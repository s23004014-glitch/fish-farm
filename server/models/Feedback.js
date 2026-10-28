import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, maxlength: 50, default: "Anonymous" },
    message: { type: String, required: [true, "Message is required"], trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

export default mongoose.model("Feedback", feedbackSchema);