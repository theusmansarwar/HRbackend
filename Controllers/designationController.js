const Designation = require("../Models/designationModel");

// CREATE DESIGNATION
const createDesignation = async (req, res) => {
  try {
    const { designationName, departmentId, status } = req.body;

    // ✅ Required field validation
    const requiredFields = ["designationName", "departmentId", "status"];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    // ✅ Check if already exists (same name under same department)
    const existingDesignation = await Designation.findOne({
      designationName,
      departmentId,
      archive: false,
    });
    if (existingDesignation) {
      return res.status(400).json({ error: "Designation already exists" });
    }

    // ✅ Generate unique Designation ID like DSG-0001
    const lastDesignation = await Designation.findOne().sort({ createdAt: -1 });
    let newIdNumber = 1;

    if (lastDesignation && lastDesignation.designationId) {
      const lastNumber = parseInt(lastDesignation.designationId.split("-")[1]);
      if (!isNaN(lastNumber)) newIdNumber = lastNumber + 1;
    }

    const designationId = `DSG-${newIdNumber.toString().padStart(4, "0")}`;

    // ✅ Create new designation
    const designation = await Designation.create({
      designationId,
      designationName,
      departmentId,
      status,
      archive: false,
      createdDate: new Date(),
      updatedDate: new Date(),
    });

    return res.status(201).json({
      status: 201,
      message: "Designation created successfully",
      data: designation,
    });
  } catch (error) {
    console.error("Error creating designation:", error);
    return res.status(500).json({
      status: 500,
      message: "Something went wrong while creating designation",
      details: error.message,
    });
  }
};

// READ ACTIVE DESIGNATIONS
const getDesignationList = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const designations = await Designation.find({ archive: false })
      .populate("departmentId", "departmentName")
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Designation.countDocuments({ archive: false });

    return res.status(200).json({
      message: "Active Designations Fetched",
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      data: designations,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// READ ARCHIVED DESIGNATIONS
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
      message: "Archived Designations Fetched",
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      data: designations,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// UPDATE DESIGNATION
const updateDesignation = async (req, res) => {
  try {
    const { id } = req.params;
    const designation = await Designation.findById(id);

    if (!designation) {
      return res.status(404).json({ error: "Designation not found" });
    }

    const requiredFields = ["designationName", "departmentId", "status"];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    Object.assign(designation, req.body, { updatedDate: new Date() });

    const updatedDesignation = await designation.save();

    return res.status(200).json({
      status: 200,
      message: "Designation updated successfully",
      data: updatedDesignation,
    });
  } catch (error) {
    console.error("Error updating designation:", error);
    return res.status(500).json({ error: error.message });
  }
};

// SOFT DELETE DESIGNATION
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

module.exports = {
  createDesignation,
  getDesignationList,
  getArchivedDesignations,
  updateDesignation,
  deleteDesignation,
};
