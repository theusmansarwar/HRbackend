const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    applicantName: {
      type: String,
      required: true,
      trim: true,
    },
    applicantEmail: {
      type: String,
      required: true,
      lowercase: true,
    },
    applicantPhone: {
      type: String,
      required: true,
    },
    resume: {
      type: String,
      required: true,
    },
    applicationDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    applicationStatus: {
      type: String,
      enum: ["Pending", "Shortlisted", "Rejected", "Hired"],
      required: true,
      default: "Pending",
    },
    interviewDate: {
      type: Date,
    },
    remarks: {
      type: String,
      required: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Application = mongoose.model("Application", applicationSchema);
module.exports = Application;
