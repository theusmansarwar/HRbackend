// controllers/departmentController.js
import Department from "../Models/departmentModel.js";
import { logActivity } from "../utils/activityLogger.js";

const ValidationRules = {
  // Department Name validation: Must start with letter, can contain letters, numbers, spaces, hyphens, ampersands
  departmentName: {
    pattern: /^[a-zA-Z][a-zA-Z0-9\s\-&]*$/,
    minLength: 2,
    maxLength: 100,
    message: "Department name must start with a letter and can only contain letters, numbers, spaces, hyphens, and ampersands (2-100 characters)",
  },
  
  // Head of Department validation: Only letters, spaces, hyphens, and apostrophes (same as name)
  headOfDepartment: {
    pattern: /^[a-zA-Z\s\-']+$/,
    minLength: 2,
    maxLength: 50,
    message: "Head of Department must contain only letters, spaces, hyphens, and apostrophes (2-50 characters)",
  },
  
  // Status validation
  status: {
    allowedValues: ['Active', 'Inactive'],
    message: "Status must be either 'Active' or 'Inactive'",
  },
};

// Validate Department Name
const validateDepartmentName = (departmentName) => {
  if (!departmentName || !departmentName.trim()) {
    return { valid: false, message: "Department Name is required" };
  }
  
  const trimmedName = departmentName.trim();
  
  if (trimmedName.length < ValidationRules.departmentName.minLength) {
    return { 
      valid: false, 
      message: `Department Name must be at least ${ValidationRules.departmentName.minLength} characters` 
    };
  }
  
  if (trimmedName.length > ValidationRules.departmentName.maxLength) {
    return { 
      valid: false, 
      message: `Department Name must not exceed ${ValidationRules.departmentName.maxLength} characters` 
    };
  }
  
  if (!ValidationRules.departmentName.pattern.test(trimmedName)) {
    return { valid: false, message: ValidationRules.departmentName.message };
  }
  
  // Additional check: Must contain at least one letter
  if (!/[a-zA-Z]/.test(trimmedName)) {
    return { valid: false, message: "Department Name must contain at least one letter" };
  }
  
  return { valid: true };
};

// Validate Head of Department
const validateHeadOfDepartment = (headOfDepartment) => {
  if (!headOfDepartment || !headOfDepartment.trim()) {
    return { valid: false, message: "Head of Department is required" };
  }
  
  const trimmedName = headOfDepartment.trim();
  
  if (trimmedName.length < ValidationRules.headOfDepartment.minLength) {
    return { 
      valid: false, 
      message: `Head of Department must be at least ${ValidationRules.headOfDepartment.minLength} characters` 
    };
  }
  
  if (trimmedName.length > ValidationRules.headOfDepartment.maxLength) {
    return { 
      valid: false, 
      message: `Head of Department must not exceed ${ValidationRules.headOfDepartment.maxLength} characters` 
    };
  }
  
  if (!ValidationRules.headOfDepartment.pattern.test(trimmedName)) {
    return { valid: false, message: ValidationRules.headOfDepartment.message };
  }
  
  return { valid: true };
};

// Validate Status
const validateStatus = (status) => {
  if (!status || !status.trim()) {
    return { valid: false, message: "Status is required" };
  }
  
  const trimmedStatus = status.trim();
  
  if (!ValidationRules.status.allowedValues.includes(trimmedStatus)) {
    return { valid: false, message: ValidationRules.status.message };
  }
  
  return { valid: true };
};

export const createDepartment = async (req, res) => {
  try {
    const { departmentName, headOfDepartment, status } = req.body;
    const missingFields = [];

    // Validate Department Name
    const deptNameValidation = validateDepartmentName(departmentName);
    if (!deptNameValidation.valid) {
      missingFields.push({ 
        name: "departmentName", 
        message: deptNameValidation.message 
      });
    }

    // Validate Head of Department
    const hodValidation = validateHeadOfDepartment(headOfDepartment);
    if (!hodValidation.valid) {
      missingFields.push({ 
        name: "headOfDepartment", 
        message: hodValidation.message 
      });
    }

    // Validate Status (optional, default to "Active" if not provided)
    if (status) {
      const statusValidation = validateStatus(status);
      if (!statusValidation.valid) {
        missingFields.push({ 
          name: "status", 
          message: statusValidation.message 
        });
      }
    }

    // Return all validation errors
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Validation failed. Please correct the errors.",
        missingFields,
      });
    }

    // Check for duplicate department name
    const existingDepartment = await Department.findOne({ 
      departmentName: { $regex: new RegExp(`^${departmentName.trim()}$`, 'i') },
      isArchived: false
    });
    
    if (existingDepartment) {
      return res.status(400).json({
        status: 400,
        message: "Department with this name already exists",
        missingFields: [{ 
          name: "departmentName", 
          message: "A department with this name already exists" 
        }],
      });
    }

    // Generate unique departmentId
    const lastDept = await Department.findOne().sort({ createdAt: -1 });
    let newIdNumber = 1;
    if (lastDept && lastDept.departmentId) {
      const lastNumber = parseInt(lastDept.departmentId.split("-")[1]);
      newIdNumber = lastNumber + 1;
    }
    const departmentId = `DEPT-${newIdNumber.toString().padStart(4, "0")}`;

    // Create department
    const department = await Department.create({
      departmentId,
      departmentName: departmentName.trim(),
      headOfDepartment: headOfDepartment.trim(),
      status: status?.trim() || "Active",
      isArchived: false,
    });

    await logActivity(
  req.user._id,     
  "Departments",       
  "CREATE",            
  null,                 
  department.toObject(), 
  req                    
);

    return res.status(201).json({
      status: 201,
      message: "Department created successfully",
      data: department,
    });
  } catch (error) {
    console.error("Create Department Error:", error);
    return res.status(500).json({
      status: 500,
      message: "Server error while creating department",
      details: error.message,
    });
  }
};

// ✅ UPDATE DEPARTMENT WITH PROFESSIONAL VALIDATION
export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { departmentName, headOfDepartment, status } = req.body;
    const missingFields = [];

    // Validate Department Name
    const deptNameValidation = validateDepartmentName(departmentName);
    if (!deptNameValidation.valid) {
      missingFields.push({ 
        name: "departmentName", 
        message: deptNameValidation.message 
      });
    }

    // Validate Head of Department
    const hodValidation = validateHeadOfDepartment(headOfDepartment);
    if (!hodValidation.valid) {
      missingFields.push({ 
        name: "headOfDepartment", 
        message: hodValidation.message 
      });
    }

    // Validate Status
    const statusValidation = validateStatus(status);
    if (!statusValidation.valid) {
      missingFields.push({ 
        name: "status", 
        message: statusValidation.message 
      });
    }

    // Return all validation errors
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Validation failed. Please correct the errors.",
        missingFields,
      });
    }

    // Check if department exists
    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({
        status: 404,
        message: "Department not found",
      });
    }

    // Check for duplicate department name (excluding current department)
    const existingDepartment = await Department.findOne({ 
      departmentName: { $regex: new RegExp(`^${departmentName.trim()}$`, 'i') },
      _id: { $ne: id },
      isArchived: false
    });
    
    if (existingDepartment) {
      return res.status(400).json({
        status: 400,
        message: "Department with this name already exists",
        missingFields: [{ 
          name: "departmentName", 
          message: "A department with this name already exists" 
        }],
      });
    }

    req.oldData = department.toObject();

    // Update department
    const updated = await Department.findByIdAndUpdate(
      id,
      {
        departmentName: departmentName.trim(),
        headOfDepartment: headOfDepartment.trim(),
        status: status.trim(),
      },
      { new: true }
    );

    await logActivity(
  req.user._id,
  "Departments",
  "UPDATE",
  req.oldData,                 
  updated.toObject(), 
  req
);

    return res.status(200).json({
      status: 200,
      message: "Department updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update Department Error:", error);
    return res.status(500).json({
      status: 500,
      message: "Server error while updating department",
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
          { departmentName: regex },
          { headOfDepartment: regex },
          { departmentId: regex },
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
      message: "Server error while fetching departments",
      error: error.message,
    });
  }
};

export const getArchivedDepartments = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const archived = await Department.find({ isArchived: true })
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Department.countDocuments({ isArchived: true });

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

export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findById(id);
    if (!department)
      return res.status(404).json({ error: "Department not found" });

    req.oldData = department.toObject(); 

    department.isArchived = true;
    await department.save();
    await logActivity(
  req.user._id,
  "Departments",
  "DELETE",
  req.oldData,   
  null,         
  req
);

    return res.status(200).json({
      message: "Department archived successfully",
      data: department,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export default {
  createDepartment,
  getDepartmentList,
  getArchivedDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
};