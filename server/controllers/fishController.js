import fs from "fs";
import path from "path";
import Fish from "../models/Fish.js";
import asyncHandler from "../utils/asyncHandler.js";

// Delete an old image file from the uploads folder
const removeImage = (imagePath) => {
  if (!imagePath || !imagePath.startsWith("/uploads/")) return;
  // path.basename stops tricks like ../../
  fs.unlink(path.resolve("uploads", path.basename(imagePath)), () => {});
};

// GET /api/fish limit=9 gives only 9 fish
export const getFish = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 0, 100);
  const query = Fish.find().sort({ createdAt: -1 });
  if (limit > 0) query.limit(limit);
  res.json(await query);
});

// GET /api/fish/:id  for all
export const getFishById = asyncHandler(async (req, res) => {
  const fish = await Fish.findById(req.params.id);
  if (!fish) {
    res.status(404);
    throw new Error("Fish not found");
  }
  res.json(fish);
});

// POST /api/fish  for admin
export const createFish = asyncHandler(async (req, res) => {
  const image = req.file ? `/uploads/${req.file.filename}` : "";
  const fish = await Fish.create({ ...req.body, image });
  res.status(201).json(fish);
});

// PUT /api/fish/:id  for admin
export const updateFish = asyncHandler(async (req, res) => {
  const fish = await Fish.findById(req.params.id);
  if (!fish) {
    if (req.file) removeImage(`/uploads/${req.file.filename}`);
    res.status(404);
    throw new Error("Fish not found");
  }

  // Only update the fields that were sent
  ["name", "price", "size", "description", "careTips", "stock"].forEach((field) => {
    if (req.body[field] !== undefined) fish[field] = req.body[field];
  });

  if (req.file) {
    removeImage(fish.image); 
    // delete the old image
    fish.image = `/uploads/${req.file.filename}`;
  }

  await fish.save();
  res.json(fish);
});

// DELETE /api/fish/:id for admin
export const deleteFish = asyncHandler(async (req, res) => {
  const fish = await Fish.findById(req.params.id);
  if (!fish) {
    res.status(404);
    throw new Error("Fish not found");
  }
  removeImage(fish.image);
  await fish.deleteOne();
  res.json({ message: "Fish deleted" });
});