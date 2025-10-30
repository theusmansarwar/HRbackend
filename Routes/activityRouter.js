// routes/activityRoutes.js
import express from "express";
import { protect } from"../Middlewares/authMiddleware.js";
import { getActivityList } from "../Controllers/activityController.js";

const router = express.Router();

router.get("/getActivityList", protect, getActivityList);

export default router;
