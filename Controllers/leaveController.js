const Leave = require("../Models/leaveModel");

// CREATE LEAVE
const createLeave = async (req, res) => {
  const { employeeId, leaveType, startDate, endDate, status } = req.body;

  if (!employeeId) return res.json({ error: "Employee ID is required" });
  if (!leaveType) return res.json({ error: "Leave Type is required" });
  if (!startDate) return res.json({ error: "Start Date is required" });
  if (!endDate) return res.json({ error: "End Date is required" });
  if (!status) return res.json({ error: "Status is required" });

  try {
    const leaveExists = await Leave.findOne({
      employeeId,
      leaveType,
      startDate,
      endDate,
      archive: false,
    });
    if (leaveExists) return res.json({ error: "Leave already exists for this period" });

    const leaveCreated = await Leave.create({
      employeeId,
      leaveType,
      startDate,
      endDate,
      status,
    });

    return res.json({
      status: 200,
      message: "Leave created successfully",
      data: leaveCreated,
    });
  } catch (error) {
    return res.status(500).json({ error: "Server Error" });
  }
};

// READ ACTIVE LEAVES (with pagination)
const getLeaveList = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const leaves = await Leave.find({ archive: false })
      .populate("employeeId")
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Leave.countDocuments({ archive: false });

    return res.status(200).json({
      message: "Active Leave List Fetched",
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      data: leaves,
    });
  } catch (error) {
    return res.status(500).json({ error: "Server Error" });
  }
};

// READ ARCHIVED LEAVES (with pagination)
const getArchivedLeaves = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const archivedLeaves = await Leave.find({ archive: true })
      .populate("employeeId")
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Leave.countDocuments({ archive: true });

    return res.status(200).json({
      message: "Archived Leaves Fetched",
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      data: archivedLeaves,
    });
  } catch (error) {
    return res.status(500).json({ error: "Server Error" });
  }
};

// GET SINGLE LEAVE BY ID
const getLeaveById = async (req, res) => {
  try {
    const { id } = req.params;
    const leave = await Leave.findById(id).populate("employeeId");

    if (!leave) return res.status(404).json({ error: "Leave not found" });

    return res.status(200).json({
      message: "Leave fetched successfully",
      data: leave,
    });
  } catch (error) {
    return res.status(500).json({ error: "Server Error" });
  }
};

// UPDATE LEAVE
const updateLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId, leaveType, startDate, endDate, status } = req.body;

    if (!employeeId) return res.json({ error: "Employee ID is required" });
    if (!leaveType) return res.json({ error: "Leave Type is required" });
    if (!startDate) return res.json({ error: "Start Date is required" });
    if (!endDate) return res.json({ error: "End Date is required" });
    if (!status) return res.json({ error: "Status is required" });

    const leave = await Leave.findById(id);
    if (!leave) return res.status(404).json({ error: "Leave not found" });

    leave.employeeId = employeeId;
    leave.leaveType = leaveType;
    leave.startDate = startDate;
    leave.endDate = endDate;
    leave.status = status;

    const updatedLeave = await leave.save();

    return res.json({
      status: 200,
      message: "Leave updated successfully",
      data: updatedLeave,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// SOFT DELETE LEAVE
const deleteLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const leave = await Leave.findById(id);
    if (!leave) return res.status(404).json({ error: "Leave not found" });

    leave.archive = true;
    await leave.save();

    return res.json({
      status: 200,
      message: "Leave archived successfully",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createLeave,
  getLeaveList,
  getArchivedLeaves,
  getLeaveById,
  updateLeave,
  deleteLeave,
};
