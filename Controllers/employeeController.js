const Employee = require("../Models/employeeModel");

// CREATE EMPLOYEE
const createEmployee = async (req, res) => {
  const requiredFields = [
    "employeeId",
    "firstName",
    "lastName",
    "email",
    "phoneNumber",
    "dateOfBirth",
    "gender",
    "cnic",
    "departmentId",
    "designationId",
    "dateOfJoining",
    "employeementType",
    "status",
    "salary",
    "bankAccountNo",
    "address",
    "emergencyContactName",
    "emergencyContactNo",
  ];

  // Validate missing fields
  for (const field of requiredFields) {
    if (!req.body[field]) return res.json({ error: `${field} is required` });
  }

  try {
    const { email } = req.body;

    const existingEmployee = await Employee.findOne({ email, isArchived: false });
    if (existingEmployee) return res.json({ error: "Employee already exists" });

    const employee = await Employee.create(req.body);

    return res.json({
      status: 200,
      message: "Employee created successfully",
      data: employee,
    });
  } catch (error) {
    return res.status(500).json({ error: "Server Error", details: error.message });
  }
};

// READ ACTIVE EMPLOYEES (with pagination)
const getEmployeeList = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const employees = await Employee.find({ isArchived: false })
      .populate("departmentId", "departmentName")
      .populate("designationId", "designationName")
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Employee.countDocuments({ isArchived: false });

    return res.status(200).json({
      message: "Active Employees Fetched",
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      data: employees,
    });
  } catch (error) {
    return res.status(500).json({ error: "Server Error" });
  }
};

// READ ARCHIVED EMPLOYEES (with pagination)
const getArchivedEmployees = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const archivedEmployees = await Employee.find({ isArchived: true })
      .populate("departmentId", "departmentName")
      .populate("designationId", "designationName")
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Employee.countDocuments({ isArchived: true });

    return res.status(200).json({
      message: "Archived Employees Fetched",
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      data: archivedEmployees,
    });
  } catch (error) {
    return res.status(500).json({ error: "Server Error" });
  }
};

// GET SINGLE EMPLOYEE BY ID
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id)
      .populate("departmentId", "departmentName")
      .populate("designationId", "designationName");

    if (!employee) return res.status(404).json({ error: "Employee not found" });

    return res.status(200).json({
      message: "Employee fetched successfully",
      data: employee,
    });
  } catch (error) {
    return res.status(500).json({ error: "Server Error" });
  }
};

// UPDATE EMPLOYEE
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);

    if (!employee) return res.status(404).json({ error: "Employee not found" });

    const requiredFields = [
      "employeeId",
      "firstName",
      "lastName",
      "email",
      "phoneNumber",
      "dateOfBirth",
      "gender",
      "cnic",
      "departmentId",
      "designationId",
      "dateOfJoining",
      "employeementType",
      "status",
      "salary",
      "bankAccountNo",
      "address",
      "emergencyContactName",
      "emergencyContactNo",
    ];

    for (const field of requiredFields) {
      if (!req.body[field]) return res.json({ error: `${field} is required` });
    }

    Object.assign(employee, req.body);

    const updatedEmployee = await employee.save();

    return res.json({
      status: 200,
      message: "Employee updated successfully",
      data: updatedEmployee,
    });
  } catch (error) {
    return res.status(500).json({ error: "Server Error", details: error.message });
  }
};

// SOFT DELETE (ARCHIVE) EMPLOYEE
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);

    if (!employee) return res.status(404).json({ error: "Employee not found" });

    employee.isArchived = true;
    await employee.save();

    return res.json({
      status: 200,
      message: "Employee archived successfully",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createEmployee,
  getEmployeeList,
  getArchivedEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};
