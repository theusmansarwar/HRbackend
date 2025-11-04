import express from "express";
import { protect } from "../Middlewares/authMiddleware.js";
import { verifyRole } from "../Middlewares/verifyRole.js";
import * as rolesController from "../Controllers/rolesController.js";
const router = express.Router();


console.log("protect:", typeof protect);
console.log("verifyRole:", typeof verifyRole);
console.log("rolesController:", typeof rolesController);
// Only Admin can manage roles
router.post("/createRole", protect, verifyRole(["HR","Admin"]), rolesController.createRole);
router.get("/getRole", protect, verifyRole(["HR","Admin"]), rolesController.getAllRoles);
router.get("/getRoleId/:id", protect, verifyRole(["HR","Admin"]), rolesController.getRoleById);
router.put("/updateRole/:id", protect, verifyRole(["HR","Admin"]), rolesController.updateRole);
router.delete("/deleteRole/:id", protect, verifyRole(["HR","Admin"]), rolesController.deleteRole);
// router.get("/getRoleByName/:name", protect, verifyRole(["Admin"]), rolesController.getRoleByName);
router.get("/getRoleByName/:name", rolesController.getRoleByName);

export default router;
