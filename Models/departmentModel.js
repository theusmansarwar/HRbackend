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
    } ,
    status: {
      type: String,
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
