const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    departmentId: {
      type: String,
      required: true,
      unique: true, // HR01, IT02 etc.
      uppercase: true,
      trim: true,
    },
    departmentName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    headOfDepartment: {
      type: String,
      required: true,
      trim: true,
    },
    createdDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    updatedDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    archiveDepartment: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Department = mongoose.model("Department", departmentSchema);
module.exports = Department;
