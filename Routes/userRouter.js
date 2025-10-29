import express from "express";
import { protect } from "../Middlewares/authMiddleware.js";
import { verifyRole } from "../Middlewares/verifyRole.js";
import * as usersController from "../Controllers/usersController.js";
const router = express.Router();

router.post("/login", usersController.loginUser);
router.post("/signup", protect, verifyRole(["HR"]), usersController.signupUser);
router.get("/getUsers", protect, verifyRole(["HR"]), usersController.getAllUsers);
router.get("/profile", protect, usersController.getProfile);
router.put("/updateUser/:id", protect, verifyRole(["HR"]), usersController.updateUser);
router.delete("/deleteUser/:id", protect, verifyRole(["HR"]), usersController.deleteUser);

export default router;
