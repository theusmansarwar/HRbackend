const Designation = require("../Models/designationModel");

const createDesignation = async (req, res) => {
  console.log("Incoming Body ===>", req.body);
  const {
    designationId,
    designationName,
    departmentId,
    createdDate,
    updatedDate,
    archive,
    status,
  } = req.body;

  if (!designationName) {
    return res.json({ error: "Designation Name is required" });
  }
  if (!departmentId) {
    return res.json({ error: "Department ID is required" });
  }
  if (!status) {
    return res.json({ error: "Status is required" });
  }

  try {
    const designationExists = await Designation.findOne({
      designationName,
      departmentId,
    });
    if (designationExists) {
      return res.json({
        error: "Designation Already Exists!",
      });
    }

    const designationCreated = await Designation.create({
      designationId,
      designationName,
      departmentId,
      createdDate,
      updatedDate,
      archive,
      status,
    });

    return res.json({
      status: 200,
      message: "Designation Created",
      data: designationCreated,
    });
  } catch (error) {
    console.error("Error creating designation:", error);
    return res.status(500).json({
      error: "Server Error",
    });
  }
};

const getDesignationList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const filter = { archive: false };

    const designationList = await Designation.find(filter)
      .populate("departmentId")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const totalDesignations = await Designation.countDocuments(filter);

    return res.status(200).json({
      message: "Designation List Fetched",
      totalDesignations,
      totalPages: Math.ceil(totalDesignations / limit),
      currentPage: page,
      limit: limit,
      data: designationList,
    });
  } catch (error) {
    return res.status(500).json({ error: "Server Error" });
  }
};

const getArchivedDesignations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const filter = { archive: true };

    const archivedList = await Designation.find(filter)
      .populate("departmentId")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const totalArchived = await Designation.countDocuments(filter);

    return res.status(200).json({
      message: "Archived Designations",
      totalArchived,
      totalPages: Math.ceil(totalArchived / limit),
      currentPage: page,
      limit: limit,
      data: archivedList,
    });
  } catch (error) {
    return res.status(500).json({ error: "Server Error" });
  }
};

const updateDesignation = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      designationId,
      designationName,
      departmentId,
      createdDate,
      updatedDate,
      archive,
      status,
    } = req.body;

    if (!designationName) {
      return res.json({ error: "Designation Name is required" });
    }
    if (!departmentId) {
      return res.json({ error: "Department ID is required" });
    }
    if (!status) {
      return res.json({ error: "Status is required" });
    }

    const designation = await Designation.findById(id);
    if (!designation) {
      return res.status(404).json({
        error: "Designation not found",
      });
    }

    designation.designationId = designationId;
    designation.designationName = designationName;
    designation.departmentId = departmentId;
    designation.createdDate = createdDate;
    designation.updatedDate = updatedDate;
    designation.archive = archive;
    designation.status = status;

    const updatedDesignation = await designation.save();

    return res.json({
      status: 200,
      message: "Designation updated successfully",
      data: updatedDesignation,
    });
  } catch (error) {
    console.error("Error updating designation:", error);
    return res.status(404).json({
      error: error.message,
    });
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

    return res.json({
      status: 200,
      message: "Designation archived successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

module.exports = {
  createDesignation,
  getDesignationList,
  getArchivedDesignations,
  updateDesignation,
  deleteDesignation,
};
