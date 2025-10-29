// controllers/departmentController.js
import Department from "../Models/departmentModel.js";

// CREATE DEPARTMENT
export const createDepartment = async (req, res) => {
  try {
    const { departmentName, headOfDepartment, status, archiveDepartment } = req.body;

    const missingFields = [];

    // ✅ VALIDATIONS
    if (!departmentName)
      missingFields.push({ name: "departmentName", message: "Department Name is required" });

    if (!headOfDepartment)
      missingFields.push({ name: "headOfDepartment", message: "Head of Department is required" });

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Missing required fields",
        missingFields,
      });
    }

    // ✅ AUTO-ID GENERATION
    const lastDept = await Department.findOne().sort({ createdAt: -1 });
    let newIdNumber = 1;
    if (lastDept && lastDept.departmentId) {
      const lastNumber = parseInt(lastDept.departmentId.split("-")[1]);
      newIdNumber = lastNumber + 1;
    }
    const departmentId = `DEPT-${newIdNumber.toString().padStart(4, "0")}`;

    // ✅ CREATE NEW DEPARTMENT
    const department = await Department.create({
      departmentId,
      departmentName,
      headOfDepartment,
      status: status || "Active",
      archiveDepartment: archiveDepartment || false,
    });

    return res.status(201).json({
      status: 201,
      message: "Department created successfully",
      data: department,
    });
  } catch (error) {
    console.error("Create Department Error:", error);
    return res.status(500).json({
      status: 500,
      message: "Something went wrong while creating department",
      details: error.message,
    });
  }
};

export const getDepartmentList = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const search = req.query.search?.trim() || "";
    const skip = (page - 1) * limit;

    const baseFilter = { isArchived: false };

    let searchFilter = {};
    if (search) {
      const regex = new RegExp(search, "i");
      searchFilter = {
        $or: [
          { name: regex },                    
          { headOfDepartment: regex },        
          { departmentName: regex },         
        ],
      };
    }

    const finalFilter = { ...baseFilter, ...searchFilter };
    const departments = await Department.find(finalFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Department.countDocuments(finalFilter);

    return res.status(200).json({
      message: "Department list fetched successfully",
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
      data: departments,
    });
  } catch (error) {
    console.error("Error fetching departments:", error);
    return res.status(500).json({
      message: "Something went wrong while fetching departments",
      error: error.message,
    });
  }
};

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

export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { departmentName, headOfDepartment, status, archiveDepartment } = req.body;

    const missingFields = [];

    if (!departmentName)
      missingFields.push({ name: "departmentName", message: "Department Name is required" });

    if (!headOfDepartment)
      missingFields.push({ name: "headOfDepartment", message: "Head of Department is required" });

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Missing required fields",
        missingFields,
      });
    }

    const updated = await Department.findByIdAndUpdate(
      id,
      {
        departmentName,
        headOfDepartment,
        status,
        archiveDepartment,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        status: 404,
        message: "Department not found",
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Department updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update Department Error:", error);
    return res.status(500).json({
      status: 500,
      message: "Something went wrong while updating department",
      details: error.message,
    });
  }
};

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
