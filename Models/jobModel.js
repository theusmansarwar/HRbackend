// models/Job.js
import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    jobId: { type: String, unique: true },
    jobTitle: { type: String, required: true, trim: true },
    jobDescription: { type: String, required: true },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    designationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Designation",
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    postingDate: { type: Date, default: Date.now, required: true },
    expiryDate: { type: Date, required: true },
    isArchived: { type: Boolean, default: false },
    applicationsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Job", jobSchema);
