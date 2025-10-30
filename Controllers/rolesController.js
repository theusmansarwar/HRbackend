import Role from "../Models/Roles.js";

export const createRole = async (req, res) => {
  try {
    const { name, modules, description, status } = req.body;

    const missingFields = [];
    if (!name)
      missingFields.push({ name: "name", message: "Role name is required" });
    if (!description)
      missingFields.push({
        name: "description",
        message: "Description is required",
      });
    if (!modules || modules.length === 0)
      missingFields.push({
        name: "modules",
        message: "Select at least one module",
      });
    if (!status)
      missingFields.push({ name: "status", message: "Status is required" });

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Missing required fields",
        missingFields,
      });
    }

    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(400).json({
        status: 400,
        message: "Role already exists",
      });
    }

    const newRole = new Role({ name, modules, description, status });
    await newRole.save();

    return res.status(201).json({
      status: 201,
      message: "Role created successfully",
      role: newRole,
    });
  } catch (error) {
    console.error("Error creating role:", error);
    return res.status(500).json({
      status: 500,
      message: "Server error while creating role",
    });
  }
};

const getAllRoles = async (req, res) => {
  try {
    // Extract query parameters safely
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const search = req.query.search?.trim() || "";
    const baseFilter = {}; 

    let roles = await Role.find(baseFilter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    if (search) {
      const regex = new RegExp(search, "i");
      roles = roles.filter(
        (role) =>
          regex.test(role.name || "") || 
          regex.test(role.description || "")  
      );
    }

    const total = await Role.countDocuments(baseFilter);

    return res.status(200).json({
      message: "Roles fetched successfully",
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
      data: roles,
    });
  } catch (error) {
    console.error("Error fetching roles:", error);
    return res.status(500).json({ error: "Server Error" });
  }
};

const getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ message: "Role not found" });
    res.json(role);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching role" });
  }
};

export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, modules, description, status } = req.body;

    const missingFields = [];
    if (!name)
      missingFields.push({ name: "name", message: "Role name is required" });
    if (!description)
      missingFields.push({
        name: "description",
        message: "Description is required",
      });
    if (!modules || modules.length === 0)
      missingFields.push({
        name: "modules",
        message: "Select at least one module",
      });
    if (!status)
      missingFields.push({ name: "status", message: "Status is required" });

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Missing required fields",
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

    role.name = name;
    role.modules = modules;
    role.description = description;
    role.status = status;

    const updatedRole = await role.save();

    return res.status(200).json({
      status: 200,
      message: "Role updated successfully",
      role: updatedRole,
    });
  } catch (error) {
    console.error("Error updating role:", error);
    return res.status(500).json({
      status: 500,
      message: "Server error while updating role",
    });
  }
};

const deleteRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id);
    if (!role) return res.status(404).json({ message: "Role not found" });

    res.json({ message: "Role deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while deleting role" });
  }
};

const getRoleByName = async (req, res) => {
  try {
    const role = await Role.findOne({ name: req.params.name });
    if (!role) return res.status(404).json({ message: "Role not found" });
    res.json(role);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export {
  getAllRoles,
  getRoleById,
  deleteRole,
  getRoleByName,
};
