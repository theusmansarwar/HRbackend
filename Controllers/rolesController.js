import Role from "../Models/Roles.js";
import { logActivity } from "../utils/activityLogger.js";


const ValidationRules = {
  // Role Name validation: Only letters, spaces, hyphens
  name: {
    pattern: /^[a-zA-Z\s\-]+$/,
    minLength: 2,
    maxLength: 50,
    message: "Role name must contain only letters, spaces, and hyphens (2-50 characters)",
  },
  
  // Description validation
  description: {
    minLength: 10,
    maxLength: 500,
    message: "Description must be between 10-500 characters",
  },
  
  // Modules validation
  modules: {
    minCount: 1,
    message: "At least one module must be selected",
  },
  
  // Status validation
  status: {
    allowedValues: ['Active', 'Inactive', 'active', 'inactive'],
    message: "Status must be either 'Active' or 'Inactive'",
  },
};

// Validate role name
const validateRoleName = (name) => {
  if (!name || !name.trim()) {
    return { valid: false, message: "Role name is required" };
  }
  
  const trimmedName = name.trim();
  
  if (trimmedName.length < ValidationRules.name.minLength) {
    return { valid: false, message: `Role name must be at least ${ValidationRules.name.minLength} characters` };
  }
  
  if (trimmedName.length > ValidationRules.name.maxLength) {
    return { valid: false, message: `Role name must not exceed ${ValidationRules.name.maxLength} characters` };
  }
  
  if (!ValidationRules.name.pattern.test(trimmedName)) {
    return { valid: false, message: ValidationRules.name.message };
  }
  
  return { valid: true, value: trimmedName };
};

// Validate description
const validateDescription = (description) => {
  if (!description || !description.trim()) {
    return { valid: false, message: "Description is required" };
  }
  
  const trimmedDescription = description.trim();
  
  if (trimmedDescription.length < ValidationRules.description.minLength) {
    return { valid: false, message: `Description must be at least ${ValidationRules.description.minLength} characters` };
  }
  
  if (trimmedDescription.length > ValidationRules.description.maxLength) {
    return { valid: false, message: `Description must not exceed ${ValidationRules.description.maxLength} characters` };
  }
  
  return { valid: true, value: trimmedDescription };
};

// Validate modules
const validateModules = (modules) => {
  if (!modules || !Array.isArray(modules) || modules.length === 0) {
    return { valid: false, message: ValidationRules.modules.message };
  }
  
  // Check if all modules are valid strings
  const invalidModules = modules.filter(module => 
    !module || typeof module !== 'string' || !module.trim()
  );
  
  if (invalidModules.length > 0) {
    return { valid: false, message: "All modules must be valid non-empty values" };
  }
  
  // Trim all modules
  const trimmedModules = modules.map(module => module.trim());
  
  // Check for duplicates
  const uniqueModules = [...new Set(trimmedModules)];
  if (uniqueModules.length !== trimmedModules.length) {
    return { valid: false, message: "Duplicate modules are not allowed" };
  }
  
  return { valid: true, value: trimmedModules };
};

// Validate status
const validateStatus = (status) => {
  if (!status || !status.trim()) {
    return { valid: false, message: "Status is required" };
  }
  
  const trimmedStatus = status.trim();
  
  if (!ValidationRules.status.allowedValues.includes(trimmedStatus)) {
    return { valid: false, message: ValidationRules.status.message };
  }
  
  // Normalize to capitalized format
  const normalizedStatus = trimmedStatus.charAt(0).toUpperCase() + trimmedStatus.slice(1).toLowerCase();
  
  return { valid: true, value: normalizedStatus };
};

export const createRole = async (req, res) => {
  try {
    const { name, modules, description, status } = req.body;
    const missingFields = [];

    // Validate Role Name
    const nameValidation = validateRoleName(name);
    if (!nameValidation.valid) {
      missingFields.push({ name: "name", message: nameValidation.message });
    }

    // Validate Description
    const descriptionValidation = validateDescription(description);
    if (!descriptionValidation.valid) {
      missingFields.push({ name: "description", message: descriptionValidation.message });
    }

    // Validate Modules
    const modulesValidation = validateModules(modules);
    if (!modulesValidation.valid) {
      missingFields.push({ name: "modules", message: modulesValidation.message });
    }

    // Validate Status
    const statusValidation = validateStatus(status);
    if (!statusValidation.valid) {
      missingFields.push({ name: "status", message: statusValidation.message });
    }

    // Return validation errors
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Validation failed. Please correct the errors.",
        missingFields,
      });
    }

    // Check for existing role
    const existingRole = await Role.findOne({ 
      name: { $regex: new RegExp(`^${nameValidation.value}$`, 'i') } 
    });
    
    if (existingRole) {
      return res.status(400).json({
        status: 400,
        message: "Role already exists",
        missingFields: [{ name: "name", message: "A role with this name already exists" }],
      });
    }

    const newRole = new Role({
      name: nameValidation.value,
      modules: modulesValidation.value,
      description: descriptionValidation.value,
      status: statusValidation.value,
    });
    
    await newRole.save();

    await logActivity(
  req.user._id,
  "Roles",
  "CREATE",
  null,
  newRole.toObject(),
  req
);


    return res.status(201).json({
      status: 201,
      message: "Role created successfully",
      data: newRole,
    });
  } catch (error) {
    console.error("Error creating role:", error);

    if (error.name === "ValidationError") {
      const missingFields = Object.keys(error.errors).map((key) => ({
        name: key,
        message: error.errors[key].message || `${key.charAt(0).toUpperCase() + key.slice(1)} is required`,
      }));
      return res.status(400).json({
        status: 400,
        message: "Validation failed",
        missingFields,
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        status: 400,
        message: "Duplicate field value",
        missingFields: [{ name: field, message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` }],
      });
    }

    return res.status(500).json({
      status: 500,
      message: "Server error while creating role",
    });
  }
};

const getAllRoles = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const search = req.query.search?.trim() || "";
    const skip = (page - 1) * limit;

    const baseFilter = {};

    if (search) {
      const regex = new RegExp(search, "i");
      baseFilter.$or = [
        { name: regex },
        { description: regex },
        { status: regex },
      ];
    }

    const roles = await Role.find(baseFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Role.countDocuments(baseFilter);

    return res.status(200).json({
      status: 200,
      message: "Roles fetched successfully",
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
      data: roles,
    });
  } catch (error) {
    console.error("Error fetching roles:", error);
    return res.status(500).json({
      status: 500,
      message: "Error fetching roles",
      error: error.message,
    });
  }
};

const getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    
    if (!role) {
      return res.status(404).json({
        status: 404,
        message: "Role not found",
      });
    }
    
    res.json({
      status: 200,
      message: "Role fetched successfully",
      data: role,
    });
  } catch (err) {
    console.error("Error fetching role:", err);
    res.status(500).json({
      status: 500,
      message: "Server error while fetching role",
    });
  }
};

export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, modules, description, status } = req.body;
    const missingFields = [];

    // Validate Role Name
    const nameValidation = validateRoleName(name);
    if (!nameValidation.valid) {
      missingFields.push({ name: "name", message: nameValidation.message });
    }

    // Validate Description
    const descriptionValidation = validateDescription(description);
    if (!descriptionValidation.valid) {
      missingFields.push({ name: "description", message: descriptionValidation.message });
    }

    // Validate Modules
    const modulesValidation = validateModules(modules);
    if (!modulesValidation.valid) {
      missingFields.push({ name: "modules", message: modulesValidation.message });
    }

    // Validate Status
    const statusValidation = validateStatus(status);
    if (!statusValidation.valid) {
      missingFields.push({ name: "status", message: statusValidation.message });
    }

    // Return validation errors
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Validation failed. Please correct the errors.",
        missingFields,
      });
    }

    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({
        status: 404,
        message: "Role not found",
      });
    }
    

    // Check if name is being changed and if it already exists
    if (nameValidation.value.toLowerCase() !== role.name.toLowerCase()) {
      const existingRole = await Role.findOne({ 
        name: { $regex: new RegExp(`^${nameValidation.value}$`, 'i') } 
      });
      
      if (existingRole) {
        return res.status(400).json({
          status: 400,
          message: "Role name already exists",
          missingFields: [{ name: "name", message: "A role with this name already exists" }],
        });
      }
    }

    req.oldData = role.toObject();


    role.name = nameValidation.value;
    role.modules = modulesValidation.value;
    role.description = descriptionValidation.value;
    role.status = statusValidation.value;

    const updatedRole = await role.save();

    await logActivity(
  req.user._id,
  "Roles",
  "UPDATE",
  req.oldData,
  updatedRole.toObject(),
  req
);


    return res.status(200).json({
      status: 200,
      message: "Role updated successfully",
      data: updatedRole,
    });
  } catch (error) {
    console.error("Error updating role:", error);

    if (error.name === "ValidationError") {
      const missingFields = Object.keys(error.errors).map((key) => ({
        name: key,
        message: error.errors[key].message || `${key.charAt(0).toUpperCase() + key.slice(1)} is required`,
      }));
      return res.status(400).json({
        status: 400,
        message: "Validation failed",
        missingFields,
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        status: 400,
        message: "Duplicate field value",
        missingFields: [{ name: field, message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` }],
      });
    }

    return res.status(500).json({
      status: 500,
      message: "Server error while updating role",
    });
  }
};

const deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        status: 404,
        message: "Role not found",
      });
    }

    req.oldData = role.toObject();  

    await Role.findByIdAndDelete(req.params.id);

    await logActivity(req.user._id, "Roles", "DELETE", req.oldData, null, req);

    res.json({
      status: 200,
      message: "Role deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting role:", err);
    res.status(500).json({
      status: 500,
      message: "Server error while deleting role",
    });
  }
};


const getRoleByName = async (req, res) => {
  try {
    const role = await Role.findOne({ name: req.params.name });
    
    if (!role) {
      return res.status(404).json({
        status: 404,
        message: "Role not found",
      });
    }
    
    res.json({
      status: 200,
      message: "Role fetched successfully",
      data: role,
    });
  } catch (err) {
    console.error("Error fetching role:", err);
    res.status(500).json({
      status: 500,
      message: "Server error while fetching role",
    });
  }
};

export {
  getAllRoles,
  getRoleById,
  deleteRole,
  getRoleByName,
};