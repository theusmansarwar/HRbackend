import mongoose from "mongoose";

const payrollSchema = new mongoose.Schema(
  {
    payrollId: {
      type: String,
      unique: true, 
      uppercase: true,
      trim: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    basicSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    allowances: {
      type: Number,
      default: 0,
      min: 0,
    },
    deductions: {
      type: Number,
      default: 0,
      min: 0,
    },
    overtime: {
      type: Number,
      default: 0,
      min: 0,
    },
    bonuses: {
      type: Number,
      default: 0,
      min: 0,
    },
    netSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    month: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
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
  },
  { timestamps: true }
);

export default mongoose.model("Payroll", payrollSchema);
