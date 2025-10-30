import express from "express";
import {
  createFine,
  getFineList,
  updateFine,
  deleteFine,
  getArchivedFines
} from "../Controllers/fineController.js";
import { logActivity } from "../Middlewares/activtyLogger.js";

const router = express.Router();

// Routes
router.post("/createFine", logActivity("Fine"),createFine);
router.get("/getFines" ,getFineList);
router.put("/updateFine/:id", logActivity("Fine"),updateFine);
router.delete("/deleteFine/:id", logActivity("Fine"),deleteFine);
router.get("/getArchivedFines", getArchivedFines);

export default router;
