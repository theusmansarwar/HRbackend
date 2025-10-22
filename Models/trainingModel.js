 import mongoose from "mongoose";

const trainingSchema = new mongoose.Schema(
  {
    trainingId: { type: String, unique: true, required: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    trainingName: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    certificate: { type: String },
    status: { type: String, enum: ["In Progress", "Pending", "Completed"], default: "In Progress" },
    isArchived: { type: Boolean, default: false }, 
  },
  { timestamps: true }
);

export default mongoose.model("Training", trainingSchema);
