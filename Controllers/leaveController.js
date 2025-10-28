import Leave from "../Models/leaveModel.js";
 
export const createLeave = async (req, res) => {
  try {
    const { employeeId, leaveType, startDate, endDate, status } = req.body;

    const missingFields = [];

    if (!employeeId)
      missingFields.push({ name: "employeeId", message: "Employee is required" });
    if (!leaveType)
      missingFields.push({ name: "leaveType", message: "Leave type is required" });
    if (!startDate)
      missingFields.push({ name: "startDate", message: "Start date is required" });
    if (!endDate)
      missingFields.push({ name: "endDate", message: "End date is required" });
    if (!status)
      missingFields.push({ name: "status", message: "Status is required" });

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Missing required fields",
        missingFields,
      });
    }

    const existingLeave = await Leave.findOne({
      employeeId,
      leaveType,
      startDate,
      endDate,
      archive: false,
    });
    if (existingLeave) {
      return res.status(400).json({
        status: 400,
        message: "Duplicate leave found for this employee and period",
      });
    }

    const lastLeave = await Leave.findOne().sort({ createdAt: -1 });
    let newIdNumber = 1;
    if (lastLeave?.leaveId) {
      const lastNumber = parseInt(lastLeave.leaveId.split("-")[1]);
      if (!isNaN(lastNumber)) newIdNumber = lastNumber + 1;
    }
    const leaveId = `LEAVE-${newIdNumber.toString().padStart(4, "0")}`;
 
    const leave = new Leave({
      leaveId,
      employeeId,
      leaveType,
      startDate,
      endDate,
      status,
    });

    await leave.save();

    return res.status(201).json({
      status: 201,
      message: "Leave created successfully ✅",
      data: leave,
    });
  } catch (error) {
    console.error("Error creating leave:", error);
    return res.status(500).json({
      status: 500,
      message: "Server error while creating leave",
    });
  }
};

export const updateLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId, leaveType, startDate, endDate, status } = req.body;

    const missingFields = [];

    if (!employeeId)
      missingFields.push({ name: "employeeId", message: "Employee is required" });
    if (!leaveType)
      missingFields.push({ name: "leaveType", message: "Leave type is required" });
    if (!startDate)
      missingFields.push({ name: "startDate", message: "Start date is required" });
    if (!endDate)
      missingFields.push({ name: "endDate", message: "End date is required" });
    if (!status)
      missingFields.push({ name: "status", message: "Status is required" });

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Missing required fields",
        missingFields,
      });
    }

    const leave = await Leave.findById(id);
    if (!leave) {
      return res.status(404).json({
        status: 404,
        message: "Leave not found",
      });
    }

    leave.employeeId = employeeId;
    leave.leaveType = leaveType;
    leave.startDate = new Date(startDate);
    leave.endDate = new Date(endDate);
    leave.status = status;

    const updatedLeave = await leave.save();

    return res.status(200).json({
      status: 200,
      message: "Leave updated successfully ✅",
      data: updatedLeave,
    });
  } catch (error) {
    console.error("Error updating leave:", error);

    if (error.name === "ValidationError") {
      const missingFields = Object.keys(error.errors).map((key) => ({
        name: key,
        message: `${key.charAt(0).toUpperCase() + key.slice(1)} is required`,
      }));

      return res.status(400).json({
        status: 400,
        message: "Validation failed",
        missingFields,
      });
    }

    return res.status(500).json({
      status: 500,
      message: "Server error while updating leave",
    });
  }
};


export const getLeaveList = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const search = req.query.search?.trim() || "";

    const baseFilter = { isArchived: false };

    let leaves = await Leave.find(baseFilter)
      .populate("employeeId", "firstName lastName email employeeId")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    if (search) {
      const regex = new RegExp(search, "i");
      leaves = leaves.filter(
        (leave) =>
          regex.test(leave.leaveType || "") ||
          regex.test(leave.status || "") ||
          regex.test(leave.reason || "") ||
          regex.test(leave.employeeId?.firstName || "") ||
          regex.test(leave.employeeId?.lastName || "") ||
          regex.test(leave.employeeId?.email || "")
      );
    }

    const total = await Leave.countDocuments(baseFilter);

    return res.status(200).json({
      message: "Active leaves fetched successfully ✅",
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
      data: leaves,
    });
  } catch (error) {
    console.error("Error fetching leaves:", error);
    return res.status(500).json({ error: "Server Error" });
  }
};


 
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
