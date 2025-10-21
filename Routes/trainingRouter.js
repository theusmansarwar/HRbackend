const express = require("express");
const {
  createTraining,
  getTrainingList,
  getTrainingById,
  updateTraining,
  deleteTraining,
  getArchivedTrainings,
} = require("../Controllers/trainingController");

const router = express.Router();

router.post("/createTraining", createTraining);
router.get("/getTrainings", getTrainingList);
router.get("/getTraining/:id", getTrainingById);
router.put("/updateTraining/:id", updateTraining);
router.delete("/deleteTraining/:id", deleteTraining);
router.get("/getArchivedTrainings", getArchivedTrainings);

module.exports = router;
