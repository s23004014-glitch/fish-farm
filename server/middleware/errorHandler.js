// Runs when no route matches the request
export const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
};

// Central error handler. Sends a clean message and hides internal details.
export const errorHandler = (err, req, res, next) => {
  let status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || "Server error";

    // Errors we create ourselves can carry their own status code
  if (err.statusCode) status = err.statusCode;

  // File upload errors (too big, wrong type)
  if (err.name === "MulterError") {
    status = 400;
    message = err.code === "LIMIT_FILE_SIZE" ? "Image must be smaller than 2MB" : err.message;
  }

  // Wrong ID format (for example /api/fish/abc)
  if (err.name === "CastError") {
    status = 400;
    message = "Invalid ID";
  }

  // Duplicate value (for example email already used)
  if (err.code === 11000) {
    status = 400;
    message = "This value is already in use";
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(", ");
  }

  // Zod validation error (we use zod from Day 7)
  if (err.name === "ZodError") {
    status = 400;
    message = err.issues.map((i) => i.message).join(", ");
  }

  // Bad or expired login token
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    status = 401;
    message = "Please log in again";
  }

  // In production, never show the real message of an unknown server error
  if (status === 500 && process.env.NODE_ENV === "production") {
    message = "Something went wrong on the server";
  }

  // Log only the message, never the request body (it may hold passwords)
  if (status === 500) console.error("Server error:", err.message);

  res.status(status).json({ message });
};