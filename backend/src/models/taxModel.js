// models/taxModel.js
import mongoose from "mongoose";

const taxSchema = new mongoose.Schema(
  {
    country: { type: String, required: true },
    state: { type: String, required: true },
    filingStatus: { type: String, enum: ["single", "married"], required: true },
    quarter: { type: String, enum: ["Q1", "Q2", "Q3", "Q4"], required: true },
    income: { type: Number, required: true },
    expenses: { type: Number, default: 0 },
    retirement: { type: Number, default: 0 },
    insurance: { type: Number, default: 0 },
    homeOffice: { type: Number, default: 0 },
    estimatedTax: { type: Number, required: true },
    status: { type: String, enum: ["active", "archived"], default: "active" }, // ✅ new field
  },
  { timestamps: true }
);

export default mongoose.model("TaxRecord", taxSchema);
