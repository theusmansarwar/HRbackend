import express from "express";
import {
  createAttendance, 
  getAttendanceList,
  getArchivedAttendances,
  updateAttendance,
  deleteAttendance
} from "../Controllers/attendanceController.js";

const router = express.Router();

router.post("/createAttendance", createAttendance);
router.get("/getAttendances", getAttendanceList);
router.get("/getArchivedAttendances", getArchivedAttendances);
router.put("/updateAttendance/:id", updateAttendance);
router.delete("/deleteAttendance/:id", deleteAttendance);

export default router;
