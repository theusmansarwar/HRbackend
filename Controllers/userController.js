import User from "../Models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Role from "../Models/Roles.js";

// ✅ PROFESSIONAL VALIDATION HELPERS
const ValidationRules = {
  // Name validation: Only letters, spaces, hyphens, and apostrophes
  name: {
    pattern: /^[a-zA-Z\s\-']+$/,
    minLength: 2,
    maxLength: 50,
    message: "Name must contain only letters, spaces, hyphens, and apostrophes (2-50 characters)",
  },
  
  // Email validation: Proper email format
  email: {
    pattern: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    message: "Please enter a valid email address (e.g., user@example.com)",
  },
  
  // Password validation: Strong password requirements
  password: {
    minLength: 8,
    maxLength: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/,
    message: "Password must be 8+ characters with uppercase, lowercase, number, and special character (@$!%*?&#)",
  },
  
  // Role validation
  role: {
    minLength: 2,
    maxLength: 30,
    pattern: /^[a-zA-Z\s]+$/,
    message: "Role must contain only letters and spaces (2-30 characters)",
  },
  
  // Status validation
  status: {
    allowedValues: ['Active', 'Inactive', 'active', 'inactive'],
    message: "Status must be either 'Active' or 'Inactive'",
  },
};

// Validate name
const validateName = (name, fieldName = "Name") => {
  if (!name || !name.trim()) {
    return { valid: false, message: `${fieldName} is required` };
  }
  
  const trimmedName = name.trim();
  
  if (trimmedName.length < ValidationRules.name.minLength) {
    return { valid: false, message: `${fieldName} must be at least ${ValidationRules.name.minLength} characters` };
  }
  
  if (trimmedName.length > ValidationRules.name.maxLength) {
    return { valid: false, message: `${fieldName} must not exceed ${ValidationRules.name.maxLength} characters` };
  }
  
  if (!ValidationRules.name.pattern.test(trimmedName)) {
    return { valid: false, message: ValidationRules.name.message };
  }
  
  return { valid: true, value: trimmedName };
};

// Validate email
const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return { valid: false, message: "Email is required" };
  }
  
  const trimmedEmail = email.trim().toLowerCase();
  
  if (!ValidationRules.email.pattern.test(trimmedEmail)) {
    return { valid: false, message: ValidationRules.email.message };
  }
  
  return { valid: true, value: trimmedEmail };
};

// Validate password
const validatePassword = (password) => {
  if (!password || !password.trim()) {
    return { valid: false, message: "Password is required" };
  }
  
  const trimmedPassword = password.trim();
  
  if (trimmedPassword.length < ValidationRules.password.minLength) {
    return { valid: false, message: `Password must be at least ${ValidationRules.password.minLength} characters` };
  }
  
  if (trimmedPassword.length > ValidationRules.password.maxLength) {
    return { valid: false, message: `Password must not exceed ${ValidationRules.password.maxLength} characters` };
  }
  
  if (!ValidationRules.password.pattern.test(trimmedPassword)) {
    return { valid: false, message: ValidationRules.password.message };
  }
  
  return { valid: true, value: trimmedPassword };
};

// Validate role
const validateRole = (role) => {
  if (!role || !role.trim()) {
    return { valid: false, message: "Role is required" };
  }
  
  const trimmedRole = role.trim();
  
  if (trimmedRole.length < ValidationRules.role.minLength) {
    return { valid: false, message: `Role must be at least ${ValidationRules.role.minLength} characters` };
  }
  
  if (trimmedRole.length > ValidationRules.role.maxLength) {
    return { valid: false, message: `Role must not exceed ${ValidationRules.role.maxLength} characters` };
  }
  
  if (!ValidationRules.role.pattern.test(trimmedRole)) {
    return { valid: false, message: ValidationRules.role.message };
  }
  
  return { valid: true, value: trimmedRole };
};

// Validate status
const validateStatus = (status) => {
  if (!status || !status.trim()) {
    return { valid: false, message: "Status is required" };
  }
  
  const trimmedStatus = status.trim();
  
  if (!ValidationRules.status.allowedValues.includes(trimmedStatus)) {
    return { valid: false, message: ValidationRules.status.message };
  }
  
  // Normalize to capitalized format
  const normalizedStatus = trimmedStatus.charAt(0).toUpperCase() + trimmedStatus.slice(1).toLowerCase();
  
  return { valid: true, value: normalizedStatus };
};

// ✅ LOGIN USER WITH PROFESSIONAL VALIDATION
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const missingFields = [];

    // Validate Email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      missingFields.push({ name: "email", message: emailValidation.message });
    }

    // Validate Password
    if (!password || !password.trim()) {
      missingFields.push({ name: "password", message: "Password is required" });
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Validation failed. Please correct the errors.",
        missingFields,
      });
    }

    const user = await User.findOne({ email: emailValidation.value });
    if (!user) {
      return res.status(400).json({
        status: 400,
        message: "Invalid Credentials",
        missingFields: [{ name: "email", message: "Invalid email or password" }],
      });
    }

    if (user.status === "Inactive" || user.status === "inactive") {
      return res.status(403).json({
        status: 403,
        message: "Account is inactive. Please contact administrator.",
      });
    }

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      return res.status(400).json({
        status: 400,
        message: "Invalid Credentials",
        missingFields: [{ name: "password", message: "Invalid email or password" }],
      });
    }

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
    console.error("Login error:", err);
    res.status(500).json({
      status: 500,
      message: "Server error during login",
    });
  }
};

// ✅ SIGNUP USER WITH PROFESSIONAL VALIDATION
export const signupUser = async (req, res) => {
  try {
    const { name, email, password, role, status = "Active" } = req.body;
    const missingFields = [];

    // Validate Name
    const nameValidation = validateName(name, "Name");
    if (!nameValidation.valid) {
      missingFields.push({ name: "name", message: nameValidation.message });
    }

    // Validate Email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      missingFields.push({ name: "email", message: emailValidation.message });
    }

    // Validate Password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      missingFields.push({ name: "password", message: passwordValidation.message });
    }

    // Validate Role
    const roleValidation = validateRole(role);
    if (!roleValidation.valid) {
      missingFields.push({ name: "role", message: roleValidation.message });
    }

    // Validate Status
    const statusValidation = validateStatus(status);
    if (!statusValidation.valid) {
      missingFields.push({ name: "status", message: statusValidation.message });
    }

    // Return validation errors
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Validation failed. Please correct the errors.",
        missingFields,
      });
    }

    // Check for existing email
    const existingUser = await User.findOne({ email: emailValidation.value });
    if (existingUser) {
      return res.status(400).json({
        status: 400,
        message: "Email already exists",
        missingFields: [{ name: "email", message: "This email is already registered" }],
      });
    }

    // Generate unique userId
    const lastUser = await User.findOne().sort({ createdAt: -1 });
    let newIdNumber = 1;
    
    if (lastUser?.userId) {
      const lastNumber = parseInt(lastUser.userId.split("-")[1]);
      if (!isNaN(lastNumber)) {
        newIdNumber = lastNumber + 1;
      }
    }

    const userId = `USR-${newIdNumber.toString().padStart(3, "0")}`;
    const hashedPassword = await bcrypt.hash(passwordValidation.value, 10);
    
    const newUser = new User({
      userId,
      name: nameValidation.value,
      email: emailValidation.value,
      password: hashedPassword,
      role: roleValidation.value,
      status: statusValidation.value,
    });
    
    await newUser.save();
    
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

// ✅ GET ALL USERS
const getAllUsers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const search = req.query.search?.trim() || "";
    const skip = (page - 1) * limit;

    const baseFilter = {};

    if (search) {
      const regex = new RegExp(search, "i");
      baseFilter.$or = [
        { userId: regex },
        { name: regex },
        { email: regex },
        { role: regex },
        { status: regex },
      ];
    }

    const users = await User.find(baseFilter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(baseFilter);

    return res.status(200).json({
      status: 200,
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
      status: 500,
      message: "Error fetching users",
      error: err.message,
    });
  }
};

// ✅ GET PROFILE
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }
    
    res.json({
      status: 200,
      message: "Profile fetched successfully",
      data: user,
    });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({
      status: 500,
      message: "Error fetching user profile",
    });
  }
};

// ✅ UPDATE USER WITH PROFESSIONAL VALIDATION
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, status } = req.body;
    const missingFields = [];

    // Validate Name
    const nameValidation = validateName(name, "Name");
    if (!nameValidation.valid) {
      missingFields.push({ name: "name", message: nameValidation.message });
    }

    // Validate Email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      missingFields.push({ name: "email", message: emailValidation.message });
    }

    // Validate Role
    const roleValidation = validateRole(role);
    if (!roleValidation.valid) {
      missingFields.push({ name: "role", message: roleValidation.message });
    }

    // Validate Status
    const statusValidation = validateStatus(status);
    if (!statusValidation.valid) {
      missingFields.push({ name: "status", message: statusValidation.message });
    }

    // Return validation errors
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Validation failed. Please correct the errors.",
        missingFields,
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }

    // Check if email is being changed and if it already exists
    if (emailValidation.value !== user.email) {
      const existingUser = await User.findOne({ email: emailValidation.value });
      if (existingUser) {
        return res.status(400).json({
          status: 400,
          message: "Email already exists",
          missingFields: [{ name: "email", message: "This email is already registered" }],
        });
      }
    }

    user.name = nameValidation.value;
    user.email = emailValidation.value;
    user.role = roleValidation.value;
    user.status = statusValidation.value;

    const updatedUser = await user.save();
    
    return res.status(200).json({
      status: 200,
      message: "User updated successfully",
      data: {
        _id: updatedUser._id,
        userId: updatedUser.userId,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status,
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);

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

// ✅ DELETE USER
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }
    
    res.json({
      status: 200,
      message: "User deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({
      status: 500,
      message: "Error deleting user",
    });
  }
};

export {
  loginUser,
  getAllUsers,
  getProfile,
  deleteUser,
};