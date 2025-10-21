const express = require("express");
const {
  createFine,
  getFineList,
  updateFine,
  deleteFine,
  getArchivedFines,
} = require("../Controllers/fineController");

const router = express.Router();

// Routes
router.post("/createFine", createFine);
router.get("/getFines", getFineList);
router.put("/updateFine/:id", updateFine);
router.delete("/deleteFine/:id", deleteFine);
router.get("/getArchivedFines", getArchivedFines);

module.exports = router;
