// src/models/budgetModel.js
import mongoose from "mongoose";

const BudgetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    spent: { type: Number, default: 0 }, // keeps DB in sync with expenses
    date: { type: Date, default: Date.now },
    description: { type: String },
  },
  { timestamps: true }
);

const Budget = mongoose.model("Budget", BudgetSchema);
export default Budget;
