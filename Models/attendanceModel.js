const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Present", "Absent", "Leave", "Late", "Half Day"],
      required: true,
    },
    checkInTime: {
      type: String, // "09:00"
      required: true,
    },
    checkOutTime: {
      type: String, // "18:00"
      required: true,
    },
    shiftName: {
      type: String,
      required: true,
    },
    overtimeHours: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);
