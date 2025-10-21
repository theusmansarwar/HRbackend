const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./Models/User");
const Role = require("./Models/Roles");

// DB connection
mongoose.connect("mongodb://localhost:27017/yourDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error(err));

async function seed() {
  try {
    // --- Create Admin Role ---
    const adminRoleExists = await Role.findOne({ name: "Admin" });
    if (!adminRoleExists) {
      await Role.create({
        name: "Admin",
        modules: ["Dashboard","Departments","Designations","Employees","Attendance","Leaves","Performance","Training","Payroll","Fines","Jobs","Applications","Reports"],
        description: "Full access Admin role",
        status: "active"
      });
      console.log("Admin role created");
    } else {
      console.log("Admin role already exists");
    }

    // --- Create Initial Admin User ---
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
      console.log("Admin user created");
    } else {
      console.log("Admin user already exists");
    }

    console.log("Seeding complete");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
