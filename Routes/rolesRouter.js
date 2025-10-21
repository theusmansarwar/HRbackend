const express = require("express");
const router = express.Router();
const { protect } = require("../Middlewares/authMiddleware");
const verifyRole = require("../Middlewares/verifyRole");
const rolesController = require("../Controllers/rolesController");

console.log("protect:", typeof protect);
console.log("verifyRole:", typeof verifyRole);
console.log("rolesController:", typeof rolesController);


// Only Admin can manage roles
router.post("/createRole", protect, verifyRole(["Admin"]), rolesController.createRole);
router.get("/getRole", protect, verifyRole(["Admin"]), rolesController.getAllRoles);
router.get("/getRoleId/:id", protect, verifyRole(["Admin"]), rolesController.getRoleById);
router.put("/updateRole/:id", protect, verifyRole(["Admin"]), rolesController.updateRole);
router.delete("/deleteRole/:id", protect, verifyRole(["Admin"]), rolesController.deleteRole);
// router.get("/getRoleByName/:name", protect, verifyRole(["Admin"]), rolesController.getRoleByName);
router.get("/getRoleByName/:name", rolesController.getRoleByName);



module.exports = router;
