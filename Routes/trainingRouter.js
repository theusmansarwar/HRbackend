import express from "express";
import {
  createTraining, 
  getTrainingList,
  getTrainingById,
  updateTraining,
  deleteTraining,
  getArchivedTrainings
} from "../Controllers/trainingController.js";

const router = express.Router();

router.post("/createTraining", createTraining);
router.get("/getTrainings", getTrainingList);
router.get("/getTraining/:id", getTrainingById);
router.put("/updateTraining/:id", updateTraining);
router.delete("/deleteTraining/:id", deleteTraining);
router.get("/getArchivedTrainings", getArchivedTrainings);

export default router;
