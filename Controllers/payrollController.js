import Payroll from "../Models/payrollModel.js";

// CREATE PAYROLL
export const createPayroll = async (req, res) => {
  try {
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

    // VALIDATIONS
    if (!employeeId)
      return res.status(400).json({ error: "Employee ID is required" });
    if (basicSalary === undefined)
      return res.status(400).json({ error: "Basic Salary is required" });
    if (netSalary === undefined)
      return res.status(400).json({ error: "Net Salary is required" });
    if (!paymentMethod)
      return res.status(400).json({ error: "Payment Method is required" });
    if (!month)
      return res.status(400).json({ error: "Month is required" });
    if (!year)
      return res.status(400).json({ error: "Year is required" });

    // Prevent duplicate payroll for same employee/month/year
    const exists = await Payroll.findOne({ employeeId, month, year, isArchived: false });
    if (exists)
      return res.status(400).json({
        error: "Payroll already exists for this employee for the given month and year",
      });

    // Auto-generate payrollId like PAYROLL-0001
    const lastPayroll = await Payroll.findOne().sort({ createdAt: -1 });
    let newIdNumber = 1;
    if (lastPayroll && lastPayroll.payrollId) {
      const lastNumber = parseInt(lastPayroll.payrollId.split("-")[1]);
      newIdNumber = lastNumber + 1;
    }
    const payrollId = `PAYROLL-${newIdNumber.toString().padStart(4, "0")}`;

    // CREATE
    const payroll = await Payroll.create({
      payrollId,
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

    return res.status(201).json({
      status: 201,
      message: "Payroll created successfully",
      data: payroll,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Something went wrong while creating payroll",
      details: error.message,
    });
  }
};

// READ ACTIVE PAYROLLS (with pagination)
export const getPayrollList = async (req, res) => {
  try {
    // Extract query parameters safely
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const search = req.query.search?.trim() || "";

    // Base filter for active payrolls
    const baseFilter = { isArchived: false };

    // Fetch payrolls with populated employee info
    let payrolls = await Payroll.find(baseFilter)
      .populate("employeeId", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Manual search filter (since populate runs post-query)
    if (search) {
      const regex = new RegExp(search, "i");
      payrolls = payrolls.filter(
        (payroll) =>
          regex.test(payroll.salaryMonth || "") ||
          regex.test(String(payroll.totalSalary || "")) ||
          regex.test(payroll.employeeId?.firstName || "") ||
          regex.test(payroll.employeeId?.lastName || "") ||
          regex.test(payroll.employeeId?.email || "")
      );
    }

    // Total count for pagination
    const total = await Payroll.countDocuments(baseFilter);

    // Send response
    return res.status(200).json({
      message: "Active payrolls fetched successfully ✅",
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
      data: payrolls,
    });
  } catch (error) {
    console.error("Error fetching payrolls:", error);
    return res.status(500).json({ error: "Server Error" });
  }
};


// READ ARCHIVED PAYROLLS (with pagination)
export const getArchivedPayrolls = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const archived = await Payroll.find({ isArchived: true })
      .populate("employeeId", "firstName lastName")
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Payroll.countDocuments({ isArchived: true });

    return res.status(200).json({
      message: "Archived payrolls fetched",
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      data: archived,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// GET SINGLE PAYROLL BY ID
export const getPayrollById = async (req, res) => {
  try {
    const { id } = req.params;

    const payroll = await Payroll.findById(id).populate(
      "employeeId",
      "firstName lastName email"
    );

    if (!payroll) {
      return res.status(404).json({ error: "Payroll not found" });
    }

    return res.status(200).json({
      message: "Payroll fetched successfully",
      data: payroll,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// UPDATE PAYROLL
export const updatePayroll = async (req, res) => {
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

    // VALIDATIONS
    if (!employeeId)
      return res.status(400).json({ error: "Employee ID is required" });
    if (basicSalary === undefined)
      return res.status(400).json({ error: "Basic Salary is required" });
    if (netSalary === undefined)
      return res.status(400).json({ error: "Net Salary is required" });
    if (!paymentMethod)
      return res.status(400).json({ error: "Payment Method is required" });
    if (!month)
      return res.status(400).json({ error: "Month is required" });
    if (!year)
      return res.status(400).json({ error: "Year is required" });

    const updatedPayroll = await Payroll.findByIdAndUpdate(
      id,
      {
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
      },
      { new: true }
    ).populate("employeeId", "firstName lastName");

    if (!updatedPayroll) {
      return res.status(404).json({ error: "Payroll not found" });
    }

    return res.status(200).json({
      message: "Payroll updated successfully",
      data: updatedPayroll,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// SOFT DELETE PAYROLL
export const deletePayroll = async (req, res) => {
  try {
    const { id } = req.params;

    const payroll = await Payroll.findById(id);
    if (!payroll) return res.status(404).json({ message: "Payroll not found" });

    payroll.isArchived = true; // Soft delete
    await payroll.save();

    return res.status(200).json({
      message: "Payroll archived successfully",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
