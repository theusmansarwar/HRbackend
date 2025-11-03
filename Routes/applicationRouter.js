import express from "express";
import upload from "../Middlewares/upload.js"; 
import {
  createApplication,
  getApplicationList,   
  updateApplication,      
  deleteApplication,
  getArchivedApplications,
  downloadResume,
} from "../Controllers/applicationController.js";

const router = express.Router();

router.post("/createApplication", upload.single('resume'), createApplication);
router.put("/updateApplication/:id", upload.single('resume'), updateApplication);
router.get("/download/:filename", downloadResume);

router.get("/getApplications", getApplicationList);
router.delete("/deleteApplication/:id", deleteApplication);
router.get("/getArchivedApplications", getArchivedApplications);

export default router;