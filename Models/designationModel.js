import mongoose from "mongoose";

const designationSchema = new mongoose.Schema(
  {
    designationId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    designationName: {
      type: String,
      required: true,
      trim: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Department",
      required: true,
    } ,
    archive: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: "Active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Designation", designationSchema);
