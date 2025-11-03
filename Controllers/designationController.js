// controllers/designationController.js
import Designation from "../Models/designationModel.js";

// ✅ PROFESSIONAL VALIDATION HELPERS FOR DESIGNATIONS
const ValidationRules = {
  // Designation Name validation: Must start with letter
  designationName: {
    pattern: /^[a-zA-Z][a-zA-Z0-9\s\-&/.()]*$/,
    minLength: 2,
    maxLength: 100,
    message: "Invalid format. Use letters, numbers, spaces, - & / . ( )",
  },
  
  // Status validation
  status: {
    allowedValues: ['Active', 'Inactive'],
    message: "Select Active or Inactive",
  },
};

// Validate Designation Name
const validateDesignationName = (designationName) => {
  if (!designationName || !designationName.trim()) {
    return { valid: false, message: "Designation Name is required" };
  }
  
  const trimmedName = designationName.trim();
  
  if (trimmedName.length < ValidationRules.designationName.minLength) {
    return { 
      valid: false, 
      message: `Minimum ${ValidationRules.designationName.minLength} characters required` 
    };
  }
  
  if (trimmedName.length > ValidationRules.designationName.maxLength) {
    return { 
      valid: false, 
      message: `Maximum ${ValidationRules.designationName.maxLength} characters allowed` 
    };
  }
  
  if (!ValidationRules.designationName.pattern.test(trimmedName)) {
    return { valid: false, message: ValidationRules.designationName.message };
  }
  
  // Must contain at least one letter
  if (!/[a-zA-Z]/.test(trimmedName)) {
    return { valid: false, message: "Must contain at least one letter" };
  }
  
  return { valid: true };
};

// Validate Department ID
const validateDepartmentId = (departmentId) => {
  if (!departmentId || !departmentId.trim()) {
    return { valid: false, message: "Department selection is required" };
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

// ✅ CREATE DESIGNATION WITH PROFESSIONAL VALIDATION
export const createDesignation = async (req, res) => {
  try {
    const { designationName, departmentId, status } = req.body;
    const missingFields = [];

    // Validate Designation Name
    const nameValidation = validateDesignationName(designationName);
    if (!nameValidation.valid) {
      missingFields.push({
        name: "designationName",
        message: nameValidation.message,
      });
    }

    // Validate Department ID
    const deptValidation = validateDepartmentId(departmentId);
    if (!deptValidation.valid) {
      missingFields.push({
        name: "departmentId",
        message: deptValidation.message,
      });
    }

    // Validate Status
    const statusValidation = validateStatus(status);
    if (!statusValidation.valid) {
      missingFields.push({
        name: "status",
        message: statusValidation.message,
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

    // Check for duplicate designation in same department
    const existingDesignation = await Designation.findOne({
      designationName: { $regex: new RegExp(`^${designationName.trim()}$`, 'i') },
      departmentId: departmentId.trim(),
      archive: false,
    });

    if (existingDesignation) {
      return res.status(400).json({
        status: 400,
        message: "Designation already exists in this department",
        missingFields: [
          {
            name: "designationName",
            message: "This designation already exists in selected department",
          },
        ],
      });
    }

    // Generate unique designationId
    const lastDesignation = await Designation.findOne().sort({ createdAt: -1 });
    let newIdNumber = 1;
    if (lastDesignation && lastDesignation.designationId) {
      const lastNumber = parseInt(lastDesignation.designationId.split("-")[1]);
      if (!isNaN(lastNumber)) newIdNumber = lastNumber + 1;
    }
    const designationId = `DSG-${newIdNumber.toString().padStart(4, "0")}`;

    // Create designation
    const designation = await Designation.create({
      designationId,
      designationName: designationName.trim(),
      departmentId: departmentId.trim(),
      status: status.trim(),
      archive: false,
    });

    return res.status(201).json({
      status: 201,
      message: "Designation created successfully",
      data: designation,
    });
  } catch (error) {
    console.error("Create Designation Error:", error);
    return res.status(500).json({
      status: 500,
      message: "Server error while creating designation",
      details: error.message,
    });
  }
};

// ✅ UPDATE DESIGNATION WITH PROFESSIONAL VALIDATION
export const updateDesignation = async (req, res) => {
  try {
    const { id } = req.params;
    const { designationName, departmentId, status } = req.body;
    const missingFields = [];

    // Check if designation exists
    const designation = await Designation.findById(id);
    if (!designation) {
      return res.status(404).json({
        status: 404,
        message: "Designation not found",
      });
    }

    // Validate Designation Name
    const nameValidation = validateDesignationName(designationName);
    if (!nameValidation.valid) {
      missingFields.push({
        name: "designationName",
        message: nameValidation.message,
      });
    }

    // Validate Department ID
    const deptValidation = validateDepartmentId(departmentId);
    if (!deptValidation.valid) {
      missingFields.push({
        name: "departmentId",
        message: deptValidation.message,
      });
    }

    // Validate Status
    const statusValidation = validateStatus(status);
    if (!statusValidation.valid) {
      missingFields.push({
        name: "status",
        message: statusValidation.message,
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

    // Check for duplicate (excluding current designation)
    const existingDesignation = await Designation.findOne({
      designationName: { $regex: new RegExp(`^${designationName.trim()}$`, 'i') },
      departmentId: departmentId.trim(),
      _id: { $ne: id },
      archive: false,
    });

    if (existingDesignation) {
      return res.status(400).json({
        status: 400,
        message: "Designation already exists in this department",
        missingFields: [
          {
            name: "designationName",
            message: "This designation already exists in selected department",
          },
        ],
      });
    }

    // Update designation
    designation.designationName = designationName.trim();
    designation.departmentId = departmentId.trim();
    designation.status = status.trim();
    designation.updatedDate = new Date();

    const updatedDesignation = await designation.save();

    return res.status(200).json({
      status: 200,
      message: "Designation updated successfully",
      data: updatedDesignation,
    });
  } catch (error) {
    console.error("Update Designation Error:", error);
    return res.status(500).json({
      status: 500,
      message: "Server error while updating designation",
      details: error.message,
    });
  }
};

// ✅ OTHER FUNCTIONS (No changes needed)
const getDesignationList = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const search = req.query.search?.trim() || "";

    const baseFilter = { archive: false };

    let designations = await Designation.find(baseFilter)
      .populate("departmentId", "departmentName")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    if (search) {
      const regex = new RegExp(search, "i");
      designations = designations.filter(
        (d) =>
          regex.test(d.designationName || "") ||
          regex.test(d.departmentId?.departmentName || "")
      );
    }

    const total = await Designation.countDocuments(baseFilter);

    return res.status(200).json({
      message: "Active designations fetched successfully",
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
      data: designations,
    });
  } catch (error) {
    console.error("Error fetching designations:", error);
    return res.status(500).json({ 
      error: "Server error while fetching designations" 
    });
  }
};

const getArchivedDesignations = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const designations = await Designation.find({ archive: true })
      .populate("departmentId", "departmentName")
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Designation.countDocuments({ archive: true });

    return res.status(200).json({
      message: "Archived designations fetched",
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      data: designations,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deleteDesignation = async (req, res) => {
  try {
    const { id } = req.params;
    const designation = await Designation.findById(id);

    if (!designation) {
      return res.status(404).json({ error: "Designation not found" });
    }

    designation.archive = true;
    await designation.save();

    return res.status(200).json({
      message: "Designation archived successfully",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export {
  getDesignationList,
  getArchivedDesignations,
  deleteDesignation,
};

export default {
  createDesignation,
  updateDesignation,
  getDesignationList,
  getArchivedDesignations,
  deleteDesignation,
};