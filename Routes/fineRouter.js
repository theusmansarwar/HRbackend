import express from "express";
import {
  createFine,
  getFineList,
  updateFine,
  deleteFine,
  getArchivedFines,
} from "../Controllers/fineController.js";
import { protect } from "../Middlewares/authMiddleware.js";

const router = express.Router();

// ❌ Remove the wrong import and middleware usage
// import { logActivity } from "../Middlewares/activtyLogger.js";

// ✅ Use only protect middleware
router.post("/createFine", protect, createFine);
router.put("/updateFine/:id", protect, updateFine);
router.delete("/deleteFine/:id", protect, deleteFine);
router.get("/getFines", protect, getFineList);
router.get("/getArchivedFines", protect, getArchivedFines);

export default router;
