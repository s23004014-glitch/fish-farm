import rateLimit from "express-rate-limit";

// Login and register. only 10 tries per 15 minutes (stops password guessing)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many attempts, please try again after 15 minutes" },
});

// Public forms like feedback, contact, requests 5 per 15 minutes (for use stop spam)
export const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: "Too many messages, please try again later" },
});


// Card payment tries: 10 per 15 minutes (stops card-guessing attacks)
export const cardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many payment attempts, please try again later" },
});