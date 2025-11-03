import express from "express";
import {
  createTraining,
  getTrainingList,
  getTrainingById,
  updateTraining,
  deleteTraining,
  getArchivedTrainings,
} from "../Controllers/trainingController.js";
import { protect } from "../Middlewares/authMiddleware.js"; 

const router = express.Router();

router.post("/createTraining", protect, createTraining);
router.put("/updateTraining/:id", protect, updateTraining);
router.delete("/deleteTraining/:id", protect, deleteTraining);

router.get("/getTrainings", protect, getTrainingList);
router.get("/getTraining/:id", protect, getTrainingById);
router.get("/getArchivedTrainings", protect, getArchivedTrainings);

export default router;
