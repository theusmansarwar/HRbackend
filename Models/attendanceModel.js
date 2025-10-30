// models/Attendance.js
import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    attendanceId: {
      type: String,
      unique: true,
      trim: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
  
    status: {
      type: String,
      required: true,
      default: "Present",
    },
    checkInTime: {
      type: String, 
      required: true,
    },
    checkOutTime: {
      type: String, 
      required: true,
    },
    shiftName: {
      type: String,
      required: true,
      trim: true,
    },
    overtimeHours: {
      type: Number,
      default: 0,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Attendance", attendanceSchema);
