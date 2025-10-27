import express from "express";
import { protect } from "../Middlewares/authMiddleware.js";
import { verifyRole } from "../Middlewares/verifyRole.js";
import * as usersController from "../Controllers/usersController.js";
const router = express.Router();


// Public login
router.post("/login", usersController.loginUser);

// Admin creates users
router.post("/signup", protect, verifyRole(["HR"]), usersController.signupUser);

// Admin/HR gets all users
router.get("/getUsers", protect, verifyRole(["HR"]), usersController.getAllUsers);

// Any logged-in user gets profile
router.get("/profile", protect, usersController.getProfile);

// Admin/HR updates user
router.put("/updateUser/:id", protect, verifyRole(["HR"]), usersController.updateUser);

// Admin deletes user
router.delete("/deleteUser/:id", protect, verifyRole(["HR"]), usersController.deleteUser);


export default router;
