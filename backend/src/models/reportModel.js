// src/models/reportModel.js
import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true }, // transactions | budgets | tax
  period: { type: String, required: true },
  format: { type: String, required: true }, // pdf|csv|xlsx
  url: { type: String }, // file URL (served by static or S3)
  metadata: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

export default mongoose.model("Report", reportSchema);
