// backend/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  country:  { type: String },
  income:   { type: String },

  // OTP fields for forgot-password flow
  resetOTP: { type: String },
  resetOTPExpiry: { type: Date },
});

module.exports = mongoose.model("User", userSchema);
