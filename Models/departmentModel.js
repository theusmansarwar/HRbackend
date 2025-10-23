import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    departmentId: {
      type: String,
      required: true,
      unique: true, 
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
      default: Date.now,
    },
    updatedDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Department", departmentSchema);
