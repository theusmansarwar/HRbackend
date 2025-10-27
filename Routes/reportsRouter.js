import express from "express";
import {
  createReport, 
  getReports,
  getReportById,
  updateReport,
  deleteReport
} from "../Controllers/reportController.js";

const router = express.Router();

router.post("/createReport", createReport);
router.get("/getReports", getReports);
router.get("/getReportById/:id", getReportById);
router.put("/updateReport/:id", updateReport);
router.delete("/deleteReport/:id", deleteReport);

export default router;
