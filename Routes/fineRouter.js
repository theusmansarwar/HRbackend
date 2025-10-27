import express from "express";
import {
  createFine,
  getFineList,
  updateFine,
  deleteFine,
  getArchivedFines
} from "../Controllers/fineController.js";

const router = express.Router();

// Routes
router.post("/createFine", createFine);
router.get("/getFines", getFineList);
router.put("/updateFine/:id", updateFine);
router.delete("/deleteFine/:id", deleteFine);
router.get("/getArchivedFines", getArchivedFines);

export default router;
