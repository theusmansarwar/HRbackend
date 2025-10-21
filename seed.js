require("dotenv").config(); // to load .env file
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./Models/User");
const Role = require("./Models/Roles");

// Connect to MongoDB Atlas
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODBURI);
    console.log("✅ MongoDB connected successfully!");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

async function seed() {
  await connectDB();

  try {
    // --- Create Admin Role ---
    const adminRoleExists = await Role.findOne({ name: "Admin" });
    if (!adminRoleExists) {
      await Role.create({
        name: "Admin",
        modules: [
          "Dashboard","Departments","Designations","Employees","Attendance","Leaves",
          "Performance","Training","Payroll","Fines","Jobs","Applications","Reports"
        ],
        description: "Full access Admin role",
        status: "active"
      });
      console.log("✅ Admin role created");
    } else {
      console.log("ℹ️ Admin role already exists");
    }

    // --- Create Admin User ---
    const adminUserExists = await User.findOne({ email: "admin@example.com" });
    if (!adminUserExists) {
      const hashedPassword = await bcrypt.hash("Admin@1234", 10);
      await User.create({
        name: "Super Admin",
        email: "admin@example.com",
        password: hashedPassword,
        role: "Admin",
        status: "active"
      });
      console.log("✅ Admin user created");
    } else {
      console.log("ℹ️ Admin user already exists");
    }

    console.log("🌱 Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seed();
