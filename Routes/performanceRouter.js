import express from "express";
import {
  createPerformance,
  getPerformanceList,
  getPerformanceById,
  updatePerformance,
  deletePerformance,
  getArchivedPerformance
} from "../Controllers/performanceController.js";

const router = express.Router();

router.post("/createPerformance", createPerformance);
router.get("/getPerformance", getPerformanceList);
router.get("/getPerformance/:id", getPerformanceById);
router.put("/updatePerformance/:id", updatePerformance);
router.delete("/deletePerformance/:id", deletePerformance);
router.get("/getArchivedPerformance", getArchivedPerformance);

export default router;
