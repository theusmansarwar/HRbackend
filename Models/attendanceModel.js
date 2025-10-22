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
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Present", "Absent", "Leave", "Late", "Half Day"],
      required: true,
      default: "Present",
    },
    checkInTime: {
      type: String, // e.g., "09:00"
      required: true,
    },
    checkOutTime: {
      type: String, // e.g., "18:00"
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
