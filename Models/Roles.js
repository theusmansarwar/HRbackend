// models/Roles.js
const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true }, // e.g., Admin, HR
  modules: {
    type: [String], // list of allowed modules
    default: [],
  },
  description: { type: String, default: "" }, // optional description
  status: { type: String, enum: ["active", "inactive"], default: "active" } // role active/inactive
}, { timestamps: true }); // adds createdAt & updatedAt

module.exports = mongoose.model('Role', roleSchema);
