import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      unique: true,
      required: true, 
    },
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
      required: true,
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
export default Application;
