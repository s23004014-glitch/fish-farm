import Request from "../models/Request.js";
import asyncHandler from "../utils/asyncHandler.js";

// POST /api/requests for visitor or buyer
export const createRequest = asyncHandler(async (req, res) => {
  const request = await Request.create({
    ...req.body,
    user: req.user ? req.user._id : undefined, 
    // linked to the buyer if logged in
  });
  res.status(201).json({ message: "Your message was sent", id: request._id });
});

// GET /api/requests/my for buyer
export const getMyRequests = asyncHandler(async (req, res) => {
  const requests = await Request.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(requests);
});