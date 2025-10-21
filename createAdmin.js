// createAdmin.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./Models/User");

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
