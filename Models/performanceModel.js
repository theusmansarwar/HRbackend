const mongoose = require("mongoose");

const performanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    KPIs: {
  type: [String],
  required: true,
},

    appraisalDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100, 
    },
    remarks: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Archived", "Not Archived"],
      default: "Not Archived",
    },
  },
  { timestamps: true }
);

const Performance = mongoose.model("Performance", performanceSchema);
module.exports = Performance;
