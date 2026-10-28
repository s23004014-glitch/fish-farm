import { z } from "zod";

// Password: min 8 characters with a letter, a number and a symbol
const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Za-z]/, "Password needs a letter")
  .regex(/[0-9]/, "Password needs a number")
  .regex(/[^A-Za-z0-9]/, "Password needs a symbol");

const phone = z
  .string()
  .trim()
  .regex(/^[0-9+\s-]{9,15}$/, "Enter a valid phone number");

// ---------- Auth ----------
export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(50),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  phone,
  password,
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const googleSchema = z.object({
  idToken: z.string().min(10, "Google token is missing"),
});

// ---------- Fish (numbers come as text from the upload form, so we coerce) ----------
export const fishSchema = z.object({
  name: z.string().trim().min(2, "Fish name is too short").max(60),
  price: z.coerce.number().positive("Price must be more than 0"),
  size: z.string().trim().max(40).optional(),
  description: z.string().trim().max(1000).optional(),
  careTips: z.string().trim().max(1000).optional(),
  stock: z.coerce.number().int("Stock must be a whole number").min(0),
});

// For editing, every field is optional
export const fishUpdateSchema = fishSchema.partial();


// ---------- Orders ----------
const mongoId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

export const orderSchema = z.object({
  items: z
    .array(
      z.object({
        fishId: mongoId,
        quantity: z.coerce.number().int().min(1).max(100),
      })
    )
    .min(1, "Cart is empty")
    .max(20, "Too many different fish in one order"),
  delivery: z.object({
    name: z.string().trim().min(2, "Name is too short").max(50),
    phone,
    address: z.string().trim().min(5, "Address is too short").max(200),
  }),
  paymentMethod: z.enum(["COD", "CARD"]),
});

export const orderIdSchema = z.object({ orderId: mongoId });

// Admin cannot set "Pending Payment" by hand
export const orderStatusSchema = z.object({
  status: z.enum(["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"]),
});

// ---------- Buyer profile ----------
export const profileSchema = z.object({
  name: z.string().trim().min(2).max(50).optional(),
  phone: phone.optional(),
  address: z.string().trim().max(200).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().optional(), // Google-only users have no password yet
  newPassword: password,
});

// ---------- Requests, feedback, contact ----------
export const requestSchema = z.object({
  name: z.string().trim().min(2).max(50),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  subject: z.string().trim().min(3, "Subject is too short").max(100),
  message: z.string().trim().min(5, "Message is too short").max(1000),
});

export const feedbackSchema = z.object({
  name: z.string().trim().max(50).optional(),
  message: z.string().trim().min(3, "Message is too short").max(500),
});

// ---------- Demo card payment ----------
export const testCardSchema = z.object({
  orderId: mongoId,
  // remove spaces and dashes, then it must be 13 to 19 digits
  cardNumber: z
    .string()
    .transform((v) => v.replace(/[\s-]/g, ""))
    .pipe(z.string().regex(/^\d{13,19}$/, "Enter a valid card number")),
  cardName: z.string().trim().min(2, "Enter the name on the card").max(50),
  expiry: z.string().trim().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Expiry must be MM/YY"),
  cvv: z.string().regex(/^\d{3,4}$/, "Enter a valid CVV"),
});