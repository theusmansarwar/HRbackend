import express from "express";
import upload from "../Middlewares/upload.js";
import { protect } from "../Middlewares/authMiddleware.js";
import {
createApplication,
getApplicationList,
updateApplication,
deleteApplication,
getArchivedApplications,
downloadResume,
} from "../Controllers/applicationController.js";

const router = express.Router();

router.post("/createApplication", protect, upload.single("resume"), createApplication);
router.put("/updateApplication/:id", protect, upload.single("resume"), updateApplication);
router.delete("/deleteApplication/:id", protect, deleteApplication);
router.get("/getApplications", protect, getApplicationList);
router.get("/getArchivedApplications", protect, getArchivedApplications);
router.get("/download/:filename", protect, downloadResume);

export default router;
