const express = require("express");
const {
  createDepartment,
  getDepartmentList,
  updateDepartment,
  deleteDepartment,
  getArchivedDepartments,
} = require("../Controllers/departmentsController");

const router = express.Router();

router.post("/createDepartment", createDepartment);
router.get("/getDepartments", getDepartmentList);
router.put("/updateDepartment/:id", updateDepartment);
router.delete("/deleteDepartment/:id", deleteDepartment);
router.get("/getArchivedDepartments", getArchivedDepartments);

module.exports = router;

