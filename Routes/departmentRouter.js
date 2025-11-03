import express from "express";
import { protect } from "../Middlewares/authMiddleware.js";
import {
  createDepartment,
  getDepartmentList,
  updateDepartment,
  deleteDepartment,
  getArchivedDepartments,
} from "../Controllers/departmentsController.js";

const router = express.Router();

router.post("/createDepartment", protect, createDepartment);
router.put("/updateDepartment/:id", protect, updateDepartment);
router.delete("/deleteDepartment/:id", protect, deleteDepartment);
router.get("/getDepartments", protect, getDepartmentList);
router.get("/getArchivedDepartments", protect, getArchivedDepartments);

export default router;
