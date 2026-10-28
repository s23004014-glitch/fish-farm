import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

// GET /api/users/profile
export const getProfile = asyncHandler(async (req, res) => {
  const { _id, name, email, phone, address, role } = req.user;
  res.json({ _id, name, email, phone, address, role });
});

// PUT emial and role cannot be changed by the user, only by admin. Password is changed in a separate route.
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  ["name", "phone", "address"].forEach((field) => {
    if (req.body[field] !== undefined) user[field] = req.body[field];
  });
  await user.save();
  res.json({ _id: user._id, name: user.name, email: user.email, phone: user.phone, address: user.address, role: user.role });
});

// PUT for changing password, only for logged in users
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");


  if (user.password) {
    if (!currentPassword || !(await user.matchPassword(currentPassword))) {
      res.status(400);
      throw new Error("Current password is wrong");
    }
  }

  user.password = newPassword;
  await user.save();
  res.json({ message: "Password changed" });
});