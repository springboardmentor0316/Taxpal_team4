import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  theme: { type: String, default: "light" },
  currency: { type: String, default: "INR" },
  notifications: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("Settings", settingsSchema);
