import User from "../Models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Role from "../Models/Roles.js";  
// LOGIN
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid Credentials" });
    if (user.status === "inactive")
      return res.status(403).json({ message: "User inactive" });

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass)
      return res.status(400).json({ message: "Invalid Credentials" });

    const roleData = await Role.findOne({ name: user.role }); // <-- role model se modules lao

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    //  Send response including modules
    res.json({
        status: 200,
      message: "Login successful",
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        modules: roleData ? roleData.modules : [], // yahan modules array bhejna zaruri hai
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// SIGNUP
const signupUser = async (req, res) => {
  try {
    const { name, email, password, role, status = "active" } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role, status });
    await newUser.save();

    res.json({ message: "Signup successful", user: { name, email, role, status } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET ALL USERS
const getAllUsers = async (req, res) => {
  try {
    // 🧭 Pagination & search query
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const search = req.query.search?.trim() || "";

    // 🔍 Base filter for users
    const baseFilter = {}; // e.g., { status: "active" } if needed

    // 🔹 Search filter: match by name, email, or role
    if (search) {
      const regex = new RegExp(search, "i");
      baseFilter.$or = [
        { name: regex },
        { email: regex },
        { role: regex },
      ];
    }

    // 🔹 Fetch users (exclude password)
    const users = await User.find(baseFilter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // 🔹 Total count for pagination
    const total = await User.countDocuments(baseFilter);

    // ✅ Send structured response
    return res.status(200).json({
      message: "Users fetched successfully ✅",
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
      data: users,
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    return res.status(500).json({ message: "Error fetching users" });
  }
};


// GET PROFILE
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching user profile" });
  }
};

// UPDATE USER
const updateUser = async (req, res) => {
  try {
    const { name, email, role, status } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.status = status || user.status;

    await user.save();
    res.json({ message: "User updated successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating user" });
  }
};

// DELETE USER
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
  signupUser,
  getAllUsers,
  getProfile,
  updateUser,
  deleteUser,
};  
