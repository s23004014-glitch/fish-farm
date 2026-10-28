import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

import authRoutes from "./routes/authRoutes.js";
import fishRoutes from "./routes/fishRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Security headers (images must be allowed to load on our React site)
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// CORS: only our React site, cookies allowed
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

// Read JSON, form data (PayHere) and cookies
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));
app.use(cookieParser());

// Remove dangerous MongoDB characters like $ from input
app.use(mongoSanitize());

// General rate limit
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: { message: "Too many requests, please try again later" },
  })
);

// Fish images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Test route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Fish farm API is running" });
});

// Real routes
app.use("/api/auth", authRoutes);
app.use("/api/fish", fishRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin", adminRoutes);

// Errors (must stay at the bottom)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});