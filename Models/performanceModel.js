// models/Performance.js
import mongoose from "mongoose";

const performanceSchema = new mongoose.Schema(
  {
    performanceId: {
      type: String,
      unique: true, // optional: you can generate unique IDs like PERF-0001
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    KPIs: {
      type: [String],
      required: true,
      default: [],
    },
    appraisalDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    remarks: {
      type: String,
      trim: true,
    },
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee", 
    },
    status: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Performance", performanceSchema);
