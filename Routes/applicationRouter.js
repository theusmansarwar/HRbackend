import express from "express";
import {
  createApplication,
  getApplicationList,   
    updateApplication,      
    deleteApplication,
    getArchivedApplications
} from "../Controllers/applicationController.js";

const router = express.Router();

router.post("/createApplication", createApplication);
router.get("/getApplications", getApplicationList);
router.put("/updateApplication/:id", updateApplication);
router.delete("/deleteApplication/:id", deleteApplication);
router.get("/getArchivedApplications", getArchivedApplications);

export default router;