const mongoose = require("mongoose");

const designationSchema = new mongoose.Schema(
  {
    designationId: {
      type: String, 
      trim: true,
    },
    designationName: {
      type: String,
      required: true,
      trim: true,
    },
    departmentId: {
      type: String,
      required: true,
    },
    createdDate: {
      type: Date,
      default: Date.now,
    },
    updatedDate: { 
      type: Date,
      default: Date.now,
    },
    archive: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Designation", designationSchema);
