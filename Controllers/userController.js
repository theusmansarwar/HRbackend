import User from "../Models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Role from "../Models/Roles.js";

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const missingFields = [];
    if (!email) missingFields.push("email");
    if (!password) missingFields.push("password");
    if (missingFields.length > 0)
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
        missingFields,
      });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid Credentials" });
    if (user.status === "inactive")
      return res.status(403).json({ message: "User inactive" });

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass)
      return res.status(400).json({ message: "Invalid Credentials" });

    const roleData = await Role.findOne({ name: user.role });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      status: 200,
      message: "Login successful",
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        modules: roleData ? roleData.modules : [],
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const signupUser = async (req, res) => {
  try {
    const { name, email, password, role, status = "Active" } = req.body;

    // Collect missing fields
    const missingFields = [];
    if (!name?.trim()) missingFields.push({ name: "name", message: "Name is required" });
    if (!email?.trim()) missingFields.push({ name: "email", message: "Email is required" });
    if (!password?.trim()) missingFields.push({ name: "password", message: "Password is required" });
    if (!role?.trim()) missingFields.push({ name: "role", message: "Role is required" });

    // Return consistent missing fields response
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Missing required fields",
        missingFields,
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.trim() });
    if (existingUser) {
      return res.status(400).json({
        status: 400,
        message: "Email already exists",
        missingFields: [{ name: "email", message: "Email already exists" }],
      });
    }

    // Generate new userId (auto-increment)
    const lastUser = await User.findOne().sort({ createdAt: -1 });
    let newIdNumber = 1;
    
    if (lastUser?.userId) {
      const lastNumber = parseInt(lastUser.userId.split("-")[1]);
      if (!isNaN(lastNumber)) {
        newIdNumber = lastNumber + 1;
      }
    }

    const userId = `USR-${newIdNumber.toString().padStart(3, "0")}`;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save new user
    const newUser = new User({
      userId,
      name: name.trim(),
      email: email.trim(),
      password: hashedPassword,
      role: role.trim(),
      status: status.trim(),
    });
    
    await newUser.save();

    // Success response
    return res.status(201).json({
      status: 201,
      message: "User created successfully",
      data: {
        _id: newUser._id,
        userId: newUser.userId,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);

    // Handle mongoose validation error
    if (error.name === "ValidationError") {
      const missingFields = Object.keys(error.errors).map((key) => ({
        name: key,
        message: error.errors[key].message || `${key.charAt(0).toUpperCase() + key.slice(1)} is required`,
      }));
      return res.status(400).json({
        status: 400,
        message: "Validation failed",
        missingFields,
      });
    }

    // Handle duplicate key error (email uniqueness)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        status: 400,
        message: "Duplicate field value",
        missingFields: [{ name: field, message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` }],
      });
    }

    return res.status(500).json({
      status: 500,
      message: "Server error while creating user",
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const search = req.query.search?.trim() || "";
    const skip = (page - 1) * limit;

    const baseFilter = {};

    // 🔍 TESTING - Pehle saare users dekho
    const allUsers = await User.find({}).select("name email status role");
    console.log("=== ALL USERS IN DATABASE ===");
    console.log(JSON.stringify(allUsers, null, 2));

    if (search) {
      const regex = new RegExp(search, "i");
      baseFilter.$or = [
        { userId: regex },
        { name: regex },
        { email: regex },
        { role: regex },
        { status: regex },
      ];
      
      console.log("Search query:", search);
    }

    const users = await User.find(baseFilter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    console.log("Found users:", users.length);

    const total = await User.countDocuments(baseFilter);

    return res.status(200).json({
      message: "Users fetched successfully",
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
      data: users,
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    return res.status(500).json({ 
      message: "Error fetching users",
      error: err.message 
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching user profile" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, status } = req.body;

    // Collect missing fields
    const missingFields = [];
    if (!name?.trim()) missingFields.push({ name: "name", message: "Name is required" });
    if (!email?.trim()) missingFields.push({ name: "email", message: "Email is required" });
    if (!role?.trim()) missingFields.push({ name: "role", message: "Role is required" });
    if (!status?.trim()) missingFields.push({ name: "status", message: "Status is required" });

    // Return consistent response if missing
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Missing required fields",
        missingFields,
      });
    }

    // Find existing user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }

    // Check if email is being changed and if it already exists
    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          status: 400,
          message: "Email already exists",
          missingFields: [{ name: "email", message: "Email already exists" }],
        });
      }
    }

    // Update user fields
    user.name = name.trim();
    user.email = email.trim();
    user.role = role.trim();
    user.status = status.trim();

    const updatedUser = await user.save();

    // Success response
    return res.status(200).json({
      status: 200,
      message: "User updated successfully",
      data: {
        _id: updatedUser._id, // Changed from 'id' to '_id' for consistency
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status,
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);

    // Handle mongoose validation error in same format
    if (error.name === "ValidationError") {
      const missingFields = Object.keys(error.errors).map((key) => ({
        name: key,
        message: error.errors[key].message || `${key.charAt(0).toUpperCase() + key.slice(1)} is required`,
      }));
      return res.status(400).json({
        status: 400,
        message: "Validation failed",
        missingFields,
      });
    }

    // Handle duplicate key error (email uniqueness)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        status: 400,
        message: "Duplicate field value",
        missingFields: [{ name: field, message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` }],
      });
    }

    return res.status(500).json({
      status: 500,
      message: "Server error while updating user",
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting user" });
  }
};

export {
  loginUser,
  getAllUsers,
  getProfile,
  deleteUser,
};
