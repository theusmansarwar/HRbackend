const express = require("express");
const {
  createLeave,
  getLeaveList,
  getLeaveById,
  updateLeave,
  deleteLeave,
  getArchivedLeaves
} = require("../Controllers/leaveController");

const router = express.Router();

router.post("/createLeave", createLeave);
router.get("/getLeaves", getLeaveList);
router.get("/getLeave/:id", getLeaveById);
router.put("/updateLeave/:id", updateLeave);
router.delete("/deleteLeave/:id", deleteLeave);
router.get("/getArchivedLeaves", getArchivedLeaves);

module.exports = router;
