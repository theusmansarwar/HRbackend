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

 
router.post("/createFine", protect, createFine);
router.put("/updateFine/:id", protect, updateFine);
router.delete("/deleteFine/:id", protect, deleteFine);
router.get("/getFines", protect, getFineList);
router.get("/getArchivedFines", protect, getArchivedFines);

export default router;
