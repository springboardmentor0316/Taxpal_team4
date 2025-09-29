// src/models/userModel.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    country: { type: String },
    income: { type: String },
    otp: { type: String },
    otpExpires: { type: Date },
  },
  { timestamps: true }
);

// ✅ indexes for uniqueness
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ name: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);
export default User;
