// src/models/transactionModel.js
import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["income", "expense"], required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: "INR" },
  date: { type: Date, default: Date.now },
  description: { type: String }, // <-- added this field
  note: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
