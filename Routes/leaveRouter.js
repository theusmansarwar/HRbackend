import express from "express";
import {
  createLeave,
  getLeaveList,
  updateLeave,
  deleteLeave,
  getArchivedLeaves,
} from "../Controllers/leaveController.js";
import { protect } from "../Middlewares/authMiddleware.js";

const router = express.Router();

router.post("/createLeave", protect, createLeave);
router.put("/updateLeave/:id", protect, updateLeave);
router.delete("/deleteLeave/:id", protect, deleteLeave);
router.get("/getLeaves", protect, getLeaveList);
router.get("/getArchivedLeaves", protect, getArchivedLeaves);

export default router;
