import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
  {
    leaveId: { 
      type: String, 
      unique: true 
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    leaveType: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      default: "Pending",
      required: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    reason: { 
      type: String, 
      trim: true, 
      default: "" 
    },
    attachmentLinks: { 
      type: [String], 
      default: [] 
    },
  },
  { timestamps: true }
);

export default mongoose.model("Leave", leaveSchema);
