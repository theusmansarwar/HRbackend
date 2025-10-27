import express from "express";
import {
  createLeave,
  getLeaveList,
  getLeaveById,
  updateLeave,
  deleteLeave,
  getArchivedLeaves
} from "../Controllers/leaveController.js";

const router = express.Router();

router.post("/createLeave", createLeave);
router.get("/getLeaves", getLeaveList);
router.get("/getLeave/:id", getLeaveById);
router.put("/updateLeave/:id", updateLeave);
router.delete("/deleteLeave/:id", deleteLeave);
router.get("/getArchivedLeaves", getArchivedLeaves);

  export default router;
