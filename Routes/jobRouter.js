import express from "express";
import {
  createJob,  
  getJobList,
  getArchivedJobs,
  updateJob,
  deleteJob,
} from "../Controllers/jobController.js";

const router = express.Router();

router.post("/createJob", createJob);
router.get("/getJobs", getJobList);
router.get("/getArchivedJobs", getArchivedJobs);
router.put("/updateJob/:id", updateJob);
router.delete("/deleteJob/:id", deleteJob);

export default router;
