// routes/activityRoutes.js
import express from "express";
import { protect } from"../Middlewares/authMiddleware.js";
import { getActivities } from "../Controllers/activityController.js";

const router = express.Router();

router.get("/getActivityList", protect, getActivities);

export default router;
