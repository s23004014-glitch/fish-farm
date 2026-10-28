import express from "express";
import {
  getFish,
  getFishById,
  createFish,
  updateFish,
  deleteFish,
} from "../controllers/fishController.js";
import { protect, adminOnly } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import validate from "../middleware/validate.js";
import { fishSchema, fishUpdateSchema } from "../utils/schemas.js";

const router = express.Router();

// Anyone can view
router.get("/", getFish);
router.get("/:id", getFishById);

// Only admin can add, edit, delete
router.post("/", protect, adminOnly, upload.single("image"), validate(fishSchema), createFish);
router.put("/:id", protect, adminOnly, upload.single("image"), validate(fishUpdateSchema), updateFish);
router.delete("/:id", protect, adminOnly, deleteFish);

export default router;