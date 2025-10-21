const Payroll = require("../Models/payrollModel");

// CREATE PAYROLL
const createPayroll = async (req, res) => {
  const {
    employeeId,
    basicSalary,
    allowances,
    deductions,
    overtime,
    bonuses,
    netSalary,
    paymentDate,
    paymentMethod,
    month,
    year,
    status,
  } = req.body;

  if (!employeeId) return res.json({ error: "Employee ID is required" });
  if (basicSalary === undefined) return res.json({ error: "Basic Salary is required" });
  if (netSalary === undefined) return res.json({ error: "Net Salary is required" });
  if (!paymentMethod) return res.json({ error: "Payment Method is required" });
  if (!month) return res.json({ error: "Month is required" });
  if (!year) return res.json({ error: "Year is required" });

  try {
    const payrollExists = await Payroll.findOne({ employeeId, month, year, isArchived: false });
    if (payrollExists) return res.json({ error: "Payroll already exists for this employee for the given month and year" });

    const payrollCreated = await Payroll.create({
      employeeId,
      basicSalary,
      allowances,
      deductions,
      overtime,
      bonuses,
      netSalary,
      paymentDate,
      paymentMethod,
      month,
      year,
      status,
    });

    return res.json({
      status: 200,
      message: "Payroll Created",
      data: payrollCreated,
    });
  } catch (error) {
    return res.status(500).json({ error: "Server Error" });
  }
};

// READ PAYROLL LIST (with pagination)
const getPayrollList = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const payrollList = await Payroll.find({ isArchived: "No" }) 
      .populate("employeeId", "firstName lastName")
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Payroll.countDocuments({ isArchived: "No" }); 

    // return res.status(200).json(payrollList);
    return res.status(200).json({ data: payrollList });

  } catch (error) {
    return res.status(500).json({ error: "Server Error" });
  }
};

// LIST ARCHIVED PAYROLLS (with pagination)
const getArchivedPayrolls = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const archivedList = await Payroll.find({ isArchived: true })
      .populate("employeeId")
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Payroll.countDocuments({ isArchived: true });

    return res.status(200).json({
      message: "Archived Payrolls",
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      data: archivedList,
    });
  } catch (error) {
    return res.status(500).json({ error: "Server Error" });
  }
};

// UPDATE PAYROLL
const updatePayroll = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      employeeId,
      basicSalary,
      allowances,
      deductions,
      overtime,
      bonuses,
      netSalary,
      paymentDate,
      paymentMethod,
      month,
      year,
      status,
    } = req.body;

    if (!employeeId) return res.json({ error: "Employee ID is required" });
    if (basicSalary === undefined) return res.json({ error: "Basic Salary is required" });
    if (netSalary === undefined) return res.json({ error: "Net Salary is required" });
    if (!paymentMethod) return res.json({ error: "Payment Method is required" });
    if (!month) return res.json({ error: "Month is required" });
    if (!year) return res.json({ error: "Year is required" });

    const payroll = await Payroll.findById(id);
    if (!payroll) return res.status(404).json({ error: "Payroll not found" });

    payroll.employeeId = employeeId;
    payroll.basicSalary = basicSalary;
    payroll.allowances = allowances;
    payroll.deductions = deductions;
    payroll.overtime = overtime;
    payroll.bonuses = bonuses;
    payroll.netSalary = netSalary;
    payroll.paymentDate = paymentDate;
    payroll.paymentMethod = paymentMethod;
    payroll.month = month;
    payroll.year = year;
    payroll.status = status;

    const updatedPayroll = await payroll.save();

    return res.json({
      status: 200,
      message: "Payroll updated successfully",
      data: updatedPayroll,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// SOFT DELETE PAYROLL
const deletePayroll = async (req, res) => {
  try {
    const { id } = req.params;
    const payroll = await Payroll.findById(id);
    if (!payroll) return res.status(404).json({ error: "Payroll not found" });

    payroll.isArchived = "Yes";

    await payroll.save();
    return res.json({
      status: 200,
      message: "Payroll archived successfully",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createPayroll,
  getPayrollList,
  getArchivedPayrolls,
  updatePayroll,
  deletePayroll,
};
