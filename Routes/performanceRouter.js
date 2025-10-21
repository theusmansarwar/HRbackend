const express = require("express");
const {
  createPerformance,
  getPerformanceList,
  getPerformanceById,
  updatePerformance,
  deletePerformance,
  getArchivedPerformance,
} = require("../Controllers/performanceController");

const router = express.Router();

router.post("/createPerformance", createPerformance);
router.get("/getPerformance", getPerformanceList);
router.get("/getPerformance/:id", getPerformanceById);
router.put("/updatePerformance/:id", updatePerformance);
router.delete("/deletePerformance/:id", deletePerformance);
router.get("/getArchivedPerformance", getArchivedPerformance);

module.exports = router;
