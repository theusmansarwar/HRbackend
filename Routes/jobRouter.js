import express from "express";
import {
  createJob,  
  getJobList,
  getArchivedJobs,
  updateJob,
  deleteJob,
} from "../Controllers/jobController.js";
import { protect } from "../Middlewares/authMiddleware.js"; 

const router = express.Router();

 
router.post("/createJob", protect, createJob);
router.get("/getJobs", protect, getJobList);
router.get("/getArchivedJobs", protect, getArchivedJobs);
router.put("/updateJob/:id", protect, updateJob);
router.delete("/deleteJob/:id", protect, deleteJob);

export default router;