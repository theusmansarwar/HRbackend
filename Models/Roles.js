import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true }, 
    modules: {
      type: [String], 
      default: [],
    },
    description: { type: String, default: "" },
    status: { type: String, required: true},  
  },
  { timestamps: true } 
);

export default mongoose.model("Role", roleSchema);
