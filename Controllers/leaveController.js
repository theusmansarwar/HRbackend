import Leave from "../Models/leaveModel.js";

// CREATE LEAVE
export const createLeave = async (req, res) => {
  try {
    const { employeeId, leaveType, startDate, endDate, status } = req.body;

    // VALIDATIONS
    if (!employeeId) return res.status(400).json({ error: "Employee ID is required" });
    if (!leaveType) return res.status(400).json({ error: "Leave Type is required" });
    if (!startDate) return res.status(400).json({ error: "Start Date is required" });
    if (!endDate) return res.status(400).json({ error: "End Date is required" });
    if (!status) return res.status(400).json({ error: "Status is required" });

    // CHECK DUPLICATE LEAVE
    const leaveExists = await Leave.findOne({
      employeeId,
      leaveType,
      startDate,
      endDate,
      archive: false,
    });
    if (leaveExists) return res.status(400).json({ error: "Leave already exists for this period" });

    // GENERATE UNIQUE LEAVE ID
    const lastLeave = await Leave.findOne().sort({ createdAt: -1 });
    let newIdNumber = 1;
    if (lastLeave && lastLeave.leaveId) {
      const lastNumber = parseInt(lastLeave.leaveId.split("-")[1]);
      newIdNumber = lastNumber + 1;
    }
    const leaveId = `LEAVE-${newIdNumber.toString().padStart(4, "0")}`;

    // CREATE LEAVE
    const leaveCreated = await Leave.create({
      leaveId,
      employeeId,
      leaveType,
      startDate,
      endDate,
      status,
    });

    return res.status(201).json({
      status: 201,
      message: "Leave created successfully",
      data: leaveCreated,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Something went wrong while creating leave",
      details: error.message,
    });
  }
};

// READ ACTIVE LEAVES (with pagination + populate)
export const getLeaveList = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const leaves = await Leave.find({ isArchived: false })
      .populate("employeeId", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Leave.countDocuments({ isArchived: false });

    return res.status(200).json({
      message: "Active leaves fetched",
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      data: leaves,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// READ ARCHIVED LEAVES (with pagination + populate)
export const getArchivedLeaves = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const leaves = await Leave.find({ archive: true })
      .populate("employeeId", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Leave.countDocuments({ archive: true });

    return res.status(200).json({
      message: "Archived leaves fetched",
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      data: leaves,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// GET SINGLE LEAVE BY ID (with populate)
export const getLeaveById = async (req, res) => {
  try {
    const { id } = req.params;
    const leave = await Leave.findById(id).populate("employeeId", "firstName lastName email");

    if (!leave) return res.status(404).json({ error: "Leave not found" });

    return res.status(200).json({
      message: "Leave fetched successfully",
      data: leave,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// UPDATE LEAVE
export const updateLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId, leaveType, startDate, endDate, status } = req.body;

    // VALIDATIONS
    if (!employeeId) return res.status(400).json({ error: "Employee ID is required" });
    if (!leaveType) return res.status(400).json({ error: "Leave Type is required" });
    if (!startDate) return res.status(400).json({ error: "Start Date is required" });
    if (!endDate) return res.status(400).json({ error: "End Date is required" });
    if (!status) return res.status(400).json({ error: "Status is required" });

    const updatedLeave = await Leave.findByIdAndUpdate(
      id,
      { employeeId, leaveType, startDate, endDate, status },
      { new: true }
    ).populate("employeeId", "firstName lastName email");

    if (!updatedLeave) return res.status(404).json({ error: "Leave not found" });

    return res.status(200).json({
      status: 200,
      message: "Leave updated successfully",
      data: updatedLeave,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// SOFT DELETE LEAVE
export const deleteLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const leave = await Leave.findById(id);
    if (!leave) return res.status(404).json({ error: "Leave not found" });

    leave.archive = true;
    await leave.save();

    return res.status(200).json({
      status: 200,
      message: "Leave archived successfully",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
