import express from "express";
import {
  createDesignation,  
  getDesignationList,
  getArchivedDesignations,
  updateDesignation,
  deleteDesignation,
} from "../Controllers/designationController.js";

const router = express.Router();

router.post("/createDesignation", createDesignation);
router.get("/getDesignations", getDesignationList);
router.get("/getArchivedDesignations", getArchivedDesignations);
router.put("/updateDesignation/:id", updateDesignation);
router.delete("/deleteDesignation/:id", deleteDesignation);

export default router;