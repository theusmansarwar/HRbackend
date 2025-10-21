const express = require("express");
const router = express.Router();
const { protect } = require("../Middlewares/authMiddleware");
const verifyRole = require("../Middlewares/verifyRole");
const rolesController = require("../Controllers/rolesController");

// Only Admin can manage roles
router.post("/createRole", protect, verifyRole(["Admin"]), rolesController.createRole);
router.get("/getRole", protect, verifyRole(["Admin"]), rolesController.getAllRoles);
router.get("/getRoleId/:id", protect, verifyRole(["Admin"]), rolesController.getRoleById);
router.put("/updateRole/:id", protect, verifyRole(["Admin"]), rolesController.updateRole);
router.delete("/deleteRole/:id", protect, verifyRole(["Admin"]), rolesController.deleteRole);

module.exports = router;
