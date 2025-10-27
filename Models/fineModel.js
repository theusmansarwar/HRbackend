import mongoose from "mongoose";

const fineSchema = new mongoose.Schema(
  {
    fineId: {
      type: String,
      required: true,
      unique: true, 
      uppercase: true,
      trim: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee", 
      required: true,
    },
    fineType: {
      type: String,
      required: true, 
      trim: true,
    },
    fineAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    fineDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
       required:true,
    },
    archiveFine: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Fine = mongoose.model("Fine", fineSchema);
export default Fine;
