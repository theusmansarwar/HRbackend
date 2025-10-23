import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  reportType: { type: String, required: true },
  filter: { type: String },
  title: { type: String, required: true },
  description: { type: String },
  generatedBy: { type: String, required: true },
  data: { type: Array, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Report", reportSchema);
