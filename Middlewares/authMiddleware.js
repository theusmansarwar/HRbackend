// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../Models/User.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    req.user = {
  _id: user._id,
  name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
  email: user.email,
  role: user.role || "User",
};

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token", error });
  }
};
