import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { generateToken, clearToken } from "../utils/generateToken.js";

// What we send back about a user withou password or other sensitive info
const userData = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  address: user.address,
  role: user.role,
});

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error("This email is already registered");
  }

  // role is always "buyer" (default in the model)
  const user = await User.create({ name, email, phone, password });
  generateToken(res, user._id);
  res.status(201).json(userData(user));
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  // Same message for wrong email and wrong password
  if (!user || !user.password || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  generateToken(res, user._id);
  res.json(userData(user));
});

// POST /api/auth/google in this frontend sends the Google idToken
export const googleLogin = asyncHandler(async (req, res) => {
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  // Ask Google to check the token is real and made for our app
  const ticket = await client.verifyIdToken({
    idToken: req.body.idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();

  if (!payload.email_verified) {
    res.status(401);
    throw new Error("Google email is not verified");
  }

  let user = await User.findOne({ email: payload.email });
  if (!user) {
    user = await User.create({
      name: payload.name,
      email: payload.email,
      googleId: payload.sub,
    });
  } else if (!user.googleId) {
    user.googleId = payload.sub; 
    // link Google to the existing account
    await user.save();
  }

  generateToken(res, user._id);
  res.json(userData(user));
});

// POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
  clearToken(res);
  res.json({ message: "Logged out" });
});

// GET /api/auth/me, frontend uses this to know who is logged in
export const getMe = asyncHandler(async (req, res) => {
  res.json(userData(req.user));
});