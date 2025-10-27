import express from "express";
import {
  createDepartment,
  getDepartmentList,
  updateDepartment,
  deleteDepartment,
  getArchivedDepartments
} from "../Controllers/departmentsController.js";

const router = express.Router();

router.post("/createDepartment", createDepartment);
router.get("/getDepartments", getDepartmentList);
router.put("/updateDepartment/:id", updateDepartment);
router.delete("/deleteDepartment/:id", deleteDepartment);
router.get("/getArchivedDepartments", getArchivedDepartments);

export default router;

