const express = require("express");
const {
  createAttendance,
  getAttendanceList,
  getArchivedAttendances,
  updateAttendance,
  deleteAttendance,
} = require("../Controllers/attendanceController");

const router = express.Router();

router.post("/createAttendance", createAttendance);
router.get("/getAttendances", getAttendanceList);
router.get("/getArchivedAttendances", getArchivedAttendances);
router.put("/updateAttendance/:id", updateAttendance);
router.delete("/deleteAttendance/:id", deleteAttendance);

module.exports = router;
