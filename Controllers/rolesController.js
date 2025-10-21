const Role = require("../Models/Roles.js");

// -------------------- CREATE ROLE --------------------
const createRole = async (req, res) => {
  try {
    const { name, modules, description, status } = req.body;

    // Check if role already exists
    const existingRole = await Role.findOne({ name });
    if (existingRole) return res.status(400).json({ message: "Role already exists" });

    const newRole = new Role({ name, modules, description, status });
    await newRole.save();

    res.status(201).json({ message: "Role created successfully", role: newRole });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while creating role" });
  }
};

// -------------------- GET ALL ROLES --------------------
const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    res.json(roles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching roles" });
  }
};

// -------------------- GET ROLE BY ID --------------------
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

// -------------------- UPDATE ROLE --------------------
const updateRole = async (req, res) => {
  try {
    const { name, modules, description, status } = req.body;

    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ message: "Role not found" });

    role.name = name || role.name;
    role.modules = modules || role.modules;
    role.description = description || role.description;
    role.status = status || role.status;

    await role.save();
    res.json({ message: "Role updated successfully", role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while updating role" });
  }
};

// -------------------- DELETE ROLE --------------------
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

module.exports = {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
  getRoleByName,
};
