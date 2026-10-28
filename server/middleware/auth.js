import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

// 1 protect: user must be logged in
export const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    res.status(401);
    throw new Error("Please log in first");
  }

  // token is fake or expired, jwt.verify throws and errorHandler sends 401
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id);
  if (!user) {
    res.status(401);
    throw new Error("User no longer exists");
  }

  req.user = user;
  next();
});

// user must have one of the allowed roles
export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    res.status(403);
    return next(new Error("You are not allowed to do this"));
  }
  next();
};

// Shortcuts we use in routes
export const adminOnly = authorize("admin");
export const buyerOnly = authorize("buyer");

// Optional login =  sets req.user if the cookie is valid, but never blocks
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    }
  } catch (error) {
    // by bad token treat the person as a visitor
  }
  next();
};