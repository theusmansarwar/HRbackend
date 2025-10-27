import express from "express";
import {
  createPayroll,
  getPayrollList,
  getArchivedPayrolls,
  updatePayroll,
  deletePayroll
} from "../Controllers/payrollController.js";
const router = express.Router();

router.post("/createPayroll", createPayroll);
router.get("/getPayrolls", getPayrollList);
router.get("/getArchivedPayrolls", getArchivedPayrolls);
router.put("/updatePayroll/:id", updatePayroll);
router.delete("/deletePayroll/:id", deletePayroll);

export default router;
