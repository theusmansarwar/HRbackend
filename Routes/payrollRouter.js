import express from "express";
import {
  createPayroll,
  getPayrollList,
  getArchivedPayrolls,
  updatePayroll,
  deletePayroll,
} from "../Controllers/payrollController.js";
import { protect } from "../Middlewares/authMiddleware.js";  

const router = express.Router();

 
router.post("/createPayroll", protect, createPayroll);
router.put("/updatePayroll/:id", protect, updatePayroll);
router.delete("/deletePayroll/:id", protect, deletePayroll);

router.get("/getPayrolls", protect, getPayrollList);
router.get("/getArchivedPayrolls", protect, getArchivedPayrolls);

export default router;
