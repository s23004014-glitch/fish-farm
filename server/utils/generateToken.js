import jwt from "jsonwebtoken";

const isProd = process.env.NODE_ENV === "production";

// Cooking - JavaScript in the browser cannot read this cookie (httpOnly)
const cookieOptions = {
  httpOnly: true,
  secure: isProd, 
  // https only in production
  sameSite: isProd ? "none" : "lax",
};

// Make a JWT and put it in a cookie
export const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
  res.cookie("token", token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
};

// Remove the cookie on logout
export const clearToken = (res) => {
  res.cookie("token", "", { ...cookieOptions, expires: new Date(0) });
};