import Feedback from "../models/Feedback.js";
import asyncHandler from "../utils/asyncHandler.js";

// GET /api/feedback  with newerst first
export const getFeedback = asyncHandler(async (req, res) => {
  const list = await Feedback.find().sort({ createdAt: -1 }).limit(50);
  res.json(list);
});

// POST /api/feedback anonymous visitor can send feedback, no login required
export const createFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.create({
    name: req.body.name || "Anonymous",
    message: req.body.message,
  });
  res.status(201).json(feedback);
});