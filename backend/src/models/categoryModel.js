// src/models/categoryModel.js
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, // optional global vs user
  name: { type: String, required: true },
  type: { type: String, enum: ["income","expense"], required: true }
});

const Category = mongoose.model("Category", categorySchema);
export default Category;
