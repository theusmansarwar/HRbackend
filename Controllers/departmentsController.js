const Department = require("../Models/departmentModel");

const createDepartment = async (req, res) => {
  const { departmentId, departmentName, headOfDepartment, createdDate, updatedDate, status, archiveDepartment } = req.body;

  if (!departmentId) return res.status(400).json({ error: "Department ID is required" });
  if (!departmentName) return res.status(400).json({ error: "Department Name is required" });
  if (!headOfDepartment) return res.status(400).json({ error: "Head of Department is required" });

  try {
    const exists = await Department.findOne({ departmentId });
    if (exists) {
      return res.status(400).json({ error: "Department Already Exists!" });
    }

    const department = await Department.create({
      departmentId,
      departmentName,
      headOfDepartment,
      createdDate: new Date(createdDate),
      updatedDate: new Date(updatedDate),
      status,
      archiveDepartment,
    });

    return res.status(200).json({
      message: "Department Created",
      data: department,
    });
  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ error: error.message });
  }
};


const getDepartmentList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const filter = { archiveDepartment: false };

    const departments = await Department.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const totalDepartments = await Department.countDocuments(filter);

    return res.status(200).json({
      message: "Department List Fetched",
      totalDepartments,
      totalPages: Math.ceil(totalDepartments / limit),
      currentPage: page,
      limit: limit,
      data: departments,
    });
  } catch (error) {
    return res.status(500).json({ error: "Server Error" });
  }
};

const getArchivedDepartments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const filter = { archiveDepartment: true };

    const archived = await Department.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const totalArchived = await Department.countDocuments(filter);

    return res.status(200).json({
      message: "Archived Departments",
      totalArchived,
      totalPages: Math.ceil(totalArchived / limit),
      currentPage: page,
      limit: limit,
      data: archived,
    });
  } catch (error) {
    return res.status(500).json({ error: "Server Error" });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { departmentId, departmentName, headOfDepartment, createdDate, updatedDate, status, archiveDepartment } = req.body;

    if (!departmentId) return res.json({ error: "Department ID is required" });
    if (!departmentName) return res.json({ error: "Department Name is required" });
    if (!headOfDepartment) return res.json({ error: "Head of Department is required" });

    const department = await Department.findById(id);
    if (!department) return res.status(404).json({ error: "Department not found" });

    department.departmentId = departmentId;
    department.departmentName = departmentName;
    department.headOfDepartment = headOfDepartment;
    department.createdDate = createdDate;
    department.updatedDate = updatedDate;
    department.status = status;
    department.archiveDepartment = archiveDepartment;

    const updated = await department.save();

    return res.json({
      status: 200,
      message: "Department Updated Successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    department.archiveDepartment = true;
    await department.save();

    return res.json({
      status: 200,
      message: "Department archived successfully",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createDepartment,
  getDepartmentList,
  getArchivedDepartments,
  updateDepartment,
  deleteDepartment,
};
