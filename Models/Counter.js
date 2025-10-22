// models/Counter.js
import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // e.g., "userId", "jobId"
  seq: { type: Number, default: 0 },     // stores the current sequence number
});

export default mongoose.model("Counter", counterSchema);
