// createAdmin.js
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./Models/User.js";

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODBURI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Create admin user
const createAdmin = async () => {
  try {
    // Delete old admin (if any)
    await User.deleteOne({ role: "admin" });
    console.log("Old admin deleted (if existed)");

    // Hash password
    const hashedPassword = await bcrypt.hash("password123", 10);

    // Create new admin
    const admin = new User({
      name: "Admin",
      email: "rahma@gmail.com",
      password: hashedPassword,
      role: "admin",
    });

    await admin.save();
    console.log("✅ Admin created successfully:", admin.email);
  } catch (error) {
    console.error("Error creating admin:", error);
  } finally {
    mongoose.connection.close();
  }
};

// Run script
const run = async () => {
  await connectDB();
  await createAdmin();
};

run();

