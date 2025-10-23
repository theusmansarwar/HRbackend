// controllers/departmentController.js
import Department from "../Models/departmentModel.js";

// CREATE DEPARTMENT
export const createDepartment = async (req, res) => {
  try {
    const {
      departmentName,
      headOfDepartment,
      status,
      createdDate,
      updatedDate,
      archiveDepartment,
    } = req.body;

    // VALIDATIONS
    if (!departmentName)
      return res.status(400).json({ error: "Department Name is required" });
    if (!headOfDepartment)
      return res.status(400).json({ error: "Head of Department is required" });

    // Generate auto-increment Department ID: "DEPT-0001"
    const lastDept = await Department.findOne().sort({ createdAt: -1 });
    let newIdNumber = 1;
    if (lastDept && lastDept.departmentId) {
      const lastNumber = parseInt(lastDept.departmentId.split("-")[1]);
      newIdNumber = lastNumber + 1;
    }
    const departmentId = `DEPT-${newIdNumber.toString().padStart(4, "0")}`;

    // CREATE NEW DEPARTMENT
    const department = await Department.create({
      departmentId,
      departmentName,
      headOfDepartment,
      createdDate: createdDate || new Date(),
      updatedDate: updatedDate || new Date(),
      status: status || "Active",
      archiveDepartment: archiveDepartment || false,
    });

    return res.status(201).json({
      status: 201,
      message: "Department created successfully",
      data: department,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Something went wrong while creating department",
      details: error.message,
    });
  }
};

// GET ACTIVE DEPARTMENTS
export const getDepartmentList = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    res.set("Cache-Control", "no-store");

    const departments = await Department.find({ archiveDepartment: false })
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Department.countDocuments({ archiveDepartment: false });

    return res.status(200).json({
      message: "Active department list fetched",
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      data: departments,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong while fetching departments",
      error: error.message,
    });
  }
};


// GET ARCHIVED DEPARTMENTS
export const getArchivedDepartments = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const archived = await Department.find({ archiveDepartment: true })
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Department.countDocuments({ archiveDepartment: true });

    return res.status(200).json({
      message: "Archived departments fetched",
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      data: archived,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// GET SINGLE DEPARTMENT BY ID
export const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findById(id);
    if (!department)
      return res.status(404).json({ error: "Department not found" });

    return res.status(200).json({
      message: "Department fetched successfully",
      data: department,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// UPDATE DEPARTMENT
export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      departmentName,
      headOfDepartment,
      status,
      updatedDate,
      archiveDepartment,
    } = req.body;

    if (!departmentName)
      return res.json({ error: "Department Name is required" });
    if (!headOfDepartment)
      return res.json({ error: "Head of Department is required" });

    const updated = await Department.findByIdAndUpdate(
      id,
      {
        departmentName,
        headOfDepartment,
        status,
        updatedDate: updatedDate || new Date(),
        archiveDepartment,
      },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ error: "Department not found" });

    return res.json({
      status: 200,
      message: "Department updated successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ARCHIVE (SOFT DELETE) DEPARTMENT
export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findById(id);
    if (!department)
      return res.status(404).json({ error: "Department not found" });

    department.archiveDepartment = true;
    await department.save();

    return res.status(200).json({
      message: "Department archived successfully",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
