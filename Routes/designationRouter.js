import express from "express";
import { protect } from "../Middlewares/authMiddleware.js";
import {
  createDesignation,
  getDesignationList,
  getArchivedDesignations,
  updateDesignation,
  deleteDesignation,
} from "../Controllers/designationController.js";

const router = express.Router();

router.post("/createDesignation", protect, createDesignation);
router.put("/updateDesignation/:id", protect, updateDesignation);
router.delete("/deleteDesignation/:id", protect, deleteDesignation);
router.get("/getDesignations", protect, getDesignationList);
router.get("/getArchivedDesignations", protect, getArchivedDesignations);

export default router;
