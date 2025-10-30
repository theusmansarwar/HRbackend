import Payroll from "../Models/payrollModel.js";


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

    const missingFields = [];

    if (!employeeId)
      missingFields.push({ name: "employeeId", message: "Employee is required" });
    if (basicSalary === undefined || basicSalary === "")
      missingFields.push({ name: "basicSalary", message: "Basic Salary is required" });
    if (allowances === undefined || allowances === "")
      missingFields.push({ name: "allowances", message: "Allowances are required" });
    if (deductions === undefined || deductions === "")
      missingFields.push({ name: "deductions", message: "Deductions are required" });
    if (overtime === undefined || overtime === "")
      missingFields.push({ name: "overtime", message: "Overtime is required" });
    if (bonuses === undefined || bonuses === "")
      missingFields.push({ name: "bonuses", message: "Bonuses are required" });
    if (netSalary === undefined || netSalary === "")
      missingFields.push({ name: "netSalary", message: "Net Salary is required" });
    if (!paymentMethod)
      missingFields.push({ name: "paymentMethod", message: "Payment Method is required" });
    if (!month)
      missingFields.push({ name: "month", message: "Month is required" });
    if (!year)
      missingFields.push({ name: "year", message: "Year is required" });

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Validation failed. Missing required fields.",
        missingFields,
      });
    }

    const exists = await Payroll.findOne({ employeeId, month, year, isArchived: false });
    if (exists) {
      return res.status(400).json({
        status: 400,
        message: "Duplicate payroll entry",
        missingFields: [
          {
            name: "month",
            message: "Payroll already exists for this employee for the given month and year",
          },
        ],
      });
    }
    const lastPayroll = await Payroll.findOne().sort({ createdAt: -1 });
    let newIdNumber = 1;
    if (lastPayroll?.payrollId) {
      const lastNumber = parseInt(lastPayroll.payrollId.split("-")[1]);
      if (!isNaN(lastNumber)) newIdNumber = lastNumber + 1;
    }
    const payrollId = `PAYROLL-${newIdNumber.toString().padStart(4, "0")}`;

    const payroll = new Payroll({
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

    await payroll.save();

    return res.status(201).json({
      status: 201,
      message: "Payroll created successfully",
      data: payroll,
    });
  } catch (error) {
    console.error("Error creating payroll:", error);
    return res.status(500).json({
      status: 500,
      message: "Server error while creating payroll",
    });
  }
};

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

    const missingFields = [];

    if (!employeeId)
      missingFields.push({ name: "employeeId", message: "Employee is required" });
    if (basicSalary === undefined || basicSalary === "")
      missingFields.push({ name: "basicSalary", message: "Basic Salary is required" });
    if (allowances === undefined || allowances === "")
      missingFields.push({ name: "allowances", message: "Allowances are required" });
    if (deductions === undefined || deductions === "")
      missingFields.push({ name: "deductions", message: "Deductions are required" });
    if (overtime === undefined || overtime === "")
      missingFields.push({ name: "overtime", message: "Overtime is required" });
    if (bonuses === undefined || bonuses === "")
      missingFields.push({ name: "bonuses", message: "Bonuses are required" });
    if (netSalary === undefined || netSalary === "")
      missingFields.push({ name: "netSalary", message: "Net Salary is required" });
    if (!paymentMethod)
      missingFields.push({ name: "paymentMethod", message: "Payment Method is required" });
    if (!month)
      missingFields.push({ name: "month", message: "Month is required" });
    if (!year)
      missingFields.push({ name: "year", message: "Year is required" });

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Validation failed. Missing required fields.",
        missingFields,
      });
    }

    const payroll = await Payroll.findById(id);
    if (!payroll) {
      return res.status(404).json({
        status: 404,
        message: "Payroll not found",
      });
    }

    Object.assign(payroll, {
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
      status: status || "Pending",
    });
    const updatedPayroll = await payroll.save();

    return res.status(200).json({
      status: 200,
      message: "Payroll updated successfully ",
      data: updatedPayroll,
    });
  } catch (error) {
    console.error("Error updating payroll:", error);
    return res.status(500).json({
      status: 500,
      message: "Server error while updating payroll",
    });
  }
};

export const getPayrollList = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const search = req.query.search?.trim() || "";
    const baseFilter = { isArchived: false };

    let payrolls = await Payroll.find(baseFilter)
      .populate("employeeId", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

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

    const total = await Payroll.countDocuments(baseFilter);
    return res.status(200).json({
      message: "Active payrolls fetched successfully",
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

export const deletePayroll = async (req, res) => {
  try {
    const { id } = req.params;

    const payroll = await Payroll.findById(id);
    if (!payroll) return res.status(404).json({ message: "Payroll not found" });

    payroll.isArchived = true;
    await payroll.save();

    return res.status(200).json({
      message: "Payroll archived successfully",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
