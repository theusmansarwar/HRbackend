const express = require("express");
const {
  createPayroll,
  getPayrollList,
  getArchivedPayrolls,
  updatePayroll,
  deletePayroll,
} = require("../Controllers/payrollController");

const router = express.Router();

router.post("/createPayroll", createPayroll);
router.get("/getPayrolls", getPayrollList);
router.get("/getArchivedPayrolls", getArchivedPayrolls);
router.put("/updatePayroll/:id", updatePayroll);
router.delete("/deletePayroll/:id", deletePayroll);

module.exports = router;
