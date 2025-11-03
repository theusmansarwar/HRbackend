import express from "express";
import {
  createPerformance,
  getPerformanceList,
  getPerformanceById,
  updatePerformance,
  deletePerformance,
  getArchivedPerformance,
} from "../Controllers/performanceController.js";
import { protect } from "../Middlewares/authMiddleware.js";

const router = express.Router();

router.post("/createPerformance", protect, createPerformance);
router.get("/getPerformance", protect, getPerformanceList);
router.get("/getPerformance/:id", protect, getPerformanceById);
router.put("/updatePerformance/:id", protect, updatePerformance);
router.delete("/deletePerformance/:id", protect, deletePerformance);
router.get("/getArchivedPerformance", protect, getArchivedPerformance);

export default router;
