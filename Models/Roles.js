import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true }, // e.g., Admin, HR
    modules: {
      type: [String], // list of allowed modules
      default: [],
    },
    description: { type: String, default: "" }, // optional description
    status: { type: String, required: true},  
  },
  { timestamps: true } // adds createdAt & updatedAt
);

export default mongoose.model("Role", roleSchema);
