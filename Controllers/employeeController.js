import Employee from "../Models/employeeModel.js";

// CREATE EMPLOYEE
const createEmployee = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      dateOfBirth,
      gender,
      cnic,
      departmentId,
      designationId,
      employeementType,
      status,
      salary,
      bankAccountNo,
      address,
      emergencyContactName,
      emergencyContactNo,
    } = req.body;

    // ✅ VALIDATIONS
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phoneNumber",
      "dateOfBirth",
      "gender",
      "cnic",
      "departmentId",
      "designationId",
      "employeementType",
      "status",
      "salary",
      "bankAccountNo",
      "address",
      "emergencyContactName",
      "emergencyContactNo",
    ];

    const missingFields = [];

    requiredFields.forEach((field) => {
      if (!req.body[field]) {
        const formattedName =
          field.charAt(0).toUpperCase() +
          field.slice(1).replace(/([A-Z])/g, " $1");
        missingFields.push({
          name: field,
          message: `${formattedName} is required`,
        });
      }
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Missing required fields",
        missingFields,
      });
    }

    // ✅ Check if email already exists
    const existingEmployee = await Employee.findOne({ email, isArchived: false });
    if (existingEmployee) {
      return res.status(400).json({
        status: 400,
        message: "Validation error",
        missingFields: [
          {
            name: "email",
            message: "Employee with this email already exists",
          },
        ],
      });
    }

    // ✅ Generate unique employeeId like "EMP-0001"
    const lastEmployee = await Employee.findOne().sort({ createdAt: -1 });
    let newIdNumber = 1;

    if (lastEmployee && lastEmployee.employeeId) {
      const lastNumber = parseInt(lastEmployee.employeeId.split("-")[1]);
      if (!isNaN(lastNumber)) {
        newIdNumber = lastNumber + 1;
      }
    }

    const employeeId = `EMP-${newIdNumber.toString().padStart(4, "0")}`;

    // ✅ Create new employee
    const employee = await Employee.create({
      employeeId,
      firstName,
      lastName,
      email,
      phoneNumber,
      dateOfBirth,
      gender,
      cnic,
      departmentId,
      designationId,
      employeementType,
      status,
      salary,
      bankAccountNo,
      address,
      emergencyContactName,
      emergencyContactNo,
    });

    return res.status(201).json({
      status: 201,
      message: "Employee created successfully",
      data: employee,
    });
  } catch (error) {
    console.error("Error creating employee:", error);
    return res.status(500).json({
      status: 500,
      message: "Something went wrong while creating employee",
      details: error.message,
    });
  }
};

// READ ACTIVE EMPLOYEES
 const getEmployeeList = async (req, res) => {
  try {
    // Query Params
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const search = req.query.search || ""; // search keyword
    // Build filter condition
    const filter = {
      isArchived: false,
      $or: [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
      ],
    };
    // Total count for pagination
    const total = await Employee.countDocuments(filter);
    // Fetch filtered + paginated employees
    const employees = await Employee.find(filter)
      .populate("departmentId", "departmentName")
      .populate("designationId", "designationName")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);
    // Send response
    return res.status(200).json({
      message: "Active Employees Fetched",
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
      data: employees,
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return res.status(500).json({ error: "Server Error" });
  }
};


// READ ARCHIVED EMPLOYEES
const getArchivedEmployees = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const employees = await Employee.find({ isArchived: true })
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
      data: employees,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// GET SINGLE EMPLOYEE
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
    return res.status(500).json({ error: error.message });
  }
};

// UPDATE EMPLOYEE
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({
        status: 404,
        message: "Employee not found",
      });
    }

    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phoneNumber",
      "dateOfBirth",
      "gender",
      "cnic",
      "departmentId",
      "designationId",
      "employeementType",
      "status",
      "salary",
      "bankAccountNo",
      "address",
      "emergencyContactName",
      "emergencyContactNo",
    ];

    const missingFields = [];

    requiredFields.forEach((field) => {
      if (!req.body[field]) {
        const formattedName =
          field.charAt(0).toUpperCase() +
          field.slice(1).replace(/([A-Z])/g, " $1");
        missingFields.push({
          name: field,
          message: `${formattedName} is required`,
        });
      }
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Missing required fields",
        missingFields,
      });
    }

    Object.assign(employee, req.body);
    const updatedEmployee = await employee.save();

    return res.status(200).json({
      status: 200,
      message: "Employee updated successfully",
      data: updatedEmployee,
    });
  } catch (error) {
    console.error("Error updating employee:", error);
    return res.status(500).json({
      status: 500,
      message: "Something went wrong while updating employee",
      details: error.message,
    });
  }
};
// SOFT DELETE EMPLOYEE
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);

    if (!employee) return res.status(404).json({ error: "Employee not found" });

    employee.isArchived = true;
    await employee.save();

    return res.status(200).json({ message: "Employee archived successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export {
  createEmployee,
  getEmployeeList,
  getArchivedEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};