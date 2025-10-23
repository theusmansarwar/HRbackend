const express = require("express");
const {
  createReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport,
} = require("../Controllers/reportController");

const router = express.Router();

router.post("/createReport", createReport);
router.get("/getReports", getReports);
router.get("/getReportById/:id", getReportById);
router.put("/updateReport/:id", updateReport);
router.delete("/deleteReport/:id", deleteReport);

module.exports = router;
