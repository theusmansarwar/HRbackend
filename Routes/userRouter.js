const express = require("express");
const router = express.Router();
const { protect } = require("../Middlewares/authMiddleware");
const verifyRole = require("../Middlewares/verifyRole");
const usersController = require("../Controllers/usersController");

// Public login
router.post("/login", usersController.loginUser);

// Admin creates users
router.post("/signup", protect, verifyRole(["Admin"]), usersController.signupUser);

// Admin/HR gets all users
router.get("/all", protect, verifyRole(["Admin", "HR"]), usersController.getAllUsers);

// Any logged-in user gets profile
router.get("/profile", protect, usersController.getProfile);

// Admin/HR updates user
router.put("/:id", protect, verifyRole(["Admin", "HR"]), usersController.updateUser);

// Admin deletes user
router.delete("/:id", protect, verifyRole(["Admin"]), usersController.deleteUser);

module.exports = router;
