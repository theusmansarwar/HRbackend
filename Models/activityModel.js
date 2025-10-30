 
import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },
      userName: { type: String, required: true },
      userEmail: { type: String, required: true },
      userRole: { type: String },
    },
    action: {
      type: String,
      enum: ["CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT"],
      required: true,
      index: true,
    },
    module: { type: String, required: true, index: true },
    recordId: { type: mongoose.Schema.Types.ObjectId, index: true },
    description: { type: String, required: true },
    changes: {
      oldValues: { type: mongoose.Schema.Types.Mixed, default: null },
      newValues: { type: mongoose.Schema.Types.Mixed, default: null },
    },
    request: {
      ipAddress: String,
      userAgent: String,
      method: String,
      url: String,
    },
  },
  { timestamps: true }
);


export default mongoose.model("ActivityLog", activityLogSchema);
