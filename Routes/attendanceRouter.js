import express from "express";
import {
  createAttendance,
  getAttendanceList,
  getArchivedAttendances,
  updateAttendance,
  deleteAttendance,
} from "../Controllers/attendanceController.js";
import { protect } from "../Middlewares/authMiddleware.js"; 

const router = express.Router();

router.post("/createAttendance", protect, createAttendance);
router.put("/updateAttendance/:id", protect, updateAttendance);
router.delete("/deleteAttendance/:id", protect, deleteAttendance);

router.get("/getAttendances", protect, getAttendanceList);
router.get("/getArchivedAttendances", protect, getArchivedAttendances);

export default router;
