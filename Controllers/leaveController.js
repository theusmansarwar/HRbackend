import Leave from "../Models/leaveModel.js";
import { logActivity } from "../utils/activityLogger.js";

const ValidationRules = {
  employeeId: {
    pattern: /^[0-9a-fA-F]{24}$/,
    message: "Invalid employee selection. Please select a valid employee.",
  },

  leaveType: {
    allowedTypes: ['Sick Leave', 'Casual Leave', 'Annual Leave', 'Maternity Leave', 'Paternity Leave', 'Unpaid Leave', 'Emergency Leave'],
    message: "Please select a valid leave type",
  },

  status: {
    allowedStatuses: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
    message: "Please select a valid status (Pending, Approved, Rejected, or Cancelled)",
  },

  date: {
    message: "Please enter a valid date in YYYY-MM-DD format",
  },
  
  reason: {
    minLength: 10,
    maxLength: 500,
    pattern: /^(?=.*[a-zA-Z])[a-zA-Z0-9\s\.,!?;:()\-'"]+$/,
    message: "Reason must be between 10-500 characters and contain meaningful text",
  },
};

const validateEmployeeId = (employeeId) => {
  if (!employeeId || !employeeId.trim()) {
    return { valid: false, message: "Employee selection is required" };
  }
  
  const trimmedId = employeeId.trim();
  
  if (!ValidationRules.employeeId.pattern.test(trimmedId)) {
    return { valid: false, message: ValidationRules.employeeId.message };
  }
  
  return { valid: true };
};

const validateLeaveType = (leaveType) => {
  if (!leaveType || !leaveType.trim()) {
    return { valid: false, message: "Leave type is required" };
  }
  
  const trimmedType = leaveType.trim();
  
  if (!ValidationRules.leaveType.allowedTypes.includes(trimmedType)) {
    return { 
      valid: false, 
      message: `Invalid leave type. Allowed types: ${ValidationRules.leaveType.allowedTypes.join(', ')}` 
    };
  }
  
  return { valid: true };
};

const validateStatus = (status) => {
  if (!status || !status.trim()) {
    return { valid: false, message: "Status is required" };
  }
  
  const trimmedStatus = status.trim();
  
  if (!ValidationRules.status.allowedStatuses.includes(trimmedStatus)) {
    return { 
      valid: false, 
      message: `Invalid status. Allowed values: ${ValidationRules.status.allowedStatuses.join(', ')}` 
    };
  }
  
  return { valid: true };
};

const validateDate = (date, fieldName = "Date") => {
  if (!date || !date.toString().trim()) {
    return { valid: false, message: `${fieldName} is required` };
  }
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return { valid: false, message: `Invalid ${fieldName} format. Please use YYYY-MM-DD format` };
  }
  
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
  
  if (dateObj < twoYearsAgo) {
    return { valid: false, message: `${fieldName} cannot be more than 2 years in the past` };
  }
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  
  if (dateObj > oneYearFromNow) {
    return { valid: false, message: `${fieldName} cannot be more than 1 year in the future` };
  }
  
  return { valid: true };
};

const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (end < start) {
    return { 
      valid: false, 
      message: "End date must be equal to or after start date" 
    };
  }
  
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays > 90) {
    return { 
      valid: false, 
      message: "Leave duration cannot exceed 90 days. Please split into multiple leave requests." 
    };
  }
  
  return { valid: true };
};

const validateReason = (reason) => {
  if (!reason || !reason.trim()) {
    return { valid: false, message: "Reason for leave is required" };
  }
  
  const trimmedReason = reason.trim();
  
  if (trimmedReason.length < ValidationRules.reason.minLength) {
    return { 
      valid: false, 
      message: `Reason must be at least ${ValidationRules.reason.minLength} characters` 
    };
  }
  
  if (trimmedReason.length > ValidationRules.reason.maxLength) {
    return { 
      valid: false, 
      message: `Reason must not exceed ${ValidationRules.reason.maxLength} characters` 
    };
  }
  
  // Check if reason contains only numbers
  if (/^\d+$/.test(trimmedReason)) {
    return { 
      valid: false, 
      message: "Reason cannot contain only numbers. Please provide a meaningful explanation" 
    };
  }
  if (!ValidationRules.reason.pattern.test(trimmedReason)) {
    return { 
      valid: false, 
      message: "Reason must contain meaningful text with letters" 
    };
  }

  const letterCount = (trimmedReason.match(/[a-zA-Z]/g) || []).length;
  const totalLength = trimmedReason.length;
  
  if (letterCount / totalLength < 0.5) {
    return { 
      valid: false, 
      message: "Reason must contain meaningful text, not just numbers or symbols" 
    };
  }
  
  return { valid: true };
};

export const createLeave = async (req, res) => {
  try {
    const { employeeId, leaveType, startDate, endDate, status, reason } = req.body;
    const missingFields = [];

    // Validate Employee ID
    const employeeValidation = validateEmployeeId(employeeId);
    if (!employeeValidation.valid) {
      missingFields.push({ name: "employeeId", message: employeeValidation.message });
    }

    // Validate Leave Type
    const leaveTypeValidation = validateLeaveType(leaveType);
    if (!leaveTypeValidation.valid) {
      missingFields.push({ name: "leaveType", message: leaveTypeValidation.message });
    }

    // Validate Start Date
    const startDateValidation = validateDate(startDate, "Start date");
    if (!startDateValidation.valid) {
      missingFields.push({ name: "startDate", message: startDateValidation.message });
    }

    // Validate End Date
    const endDateValidation = validateDate(endDate, "End date");
    if (!endDateValidation.valid) {
      missingFields.push({ name: "endDate", message: endDateValidation.message });
    }

    // Validate Date Range (only if both dates are valid)
    if (startDateValidation.valid && endDateValidation.valid) {
      const dateRangeValidation = validateDateRange(startDate, endDate);
      if (!dateRangeValidation.valid) {
        missingFields.push({ name: "endDate", message: dateRangeValidation.message });
      }
    }

    // Validate Status
    const statusValidation = validateStatus(status);
    if (!statusValidation.valid) {
      missingFields.push({ name: "status", message: statusValidation.message });
    }

    // Validate Reason
    const reasonValidation = validateReason(reason);
    if (!reasonValidation.valid) {
      missingFields.push({ name: "reason", message: reasonValidation.message });
    }

    // Return all validation errors
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Validation failed. Please correct the errors.",
        missingFields,
      });
    }

    // Check for duplicate/overlapping leave
    const existingLeave = await Leave.findOne({
      employeeId: employeeId.trim(),
      isArchived: false,
      $or: [
        // Check if new leave overlaps with existing leave
        {
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(startDate) }
        }
      ]
    });

    if (existingLeave) {
      return res.status(400).json({
        status: 400,
        message: "Leave request overlaps with an existing leave period",
        missingFields: [
          { 
            name: "startDate", 
            message: "This leave period conflicts with an existing leave request" 
          }
        ],
      });
    }

    // Generate unique leaveId
    const lastLeave = await Leave.findOne().sort({ createdAt: -1 });
    let newIdNumber = 1;
    if (lastLeave?.leaveId) {
      const lastNumber = parseInt(lastLeave.leaveId.split("-")[1]);
      if (!isNaN(lastNumber)) newIdNumber = lastNumber + 1;
    }
    const leaveId = `LEAVE-${newIdNumber.toString().padStart(4, "0")}`;

    // Create leave
    const leave = new Leave({
      leaveId,
      employeeId: employeeId.trim(),
      leaveType: leaveType.trim(),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: status.trim(),
      reason: reason.trim(),
    });

    await leave.save();

    await logActivity(
      req.user._id,
      "Leaves",
      "CREATE",
      null,
      leave.toObject(),
      req
    );

    return res.status(201).json({
      status: 201,
      message: "Leave created successfully",
      data: leave,
    });
  } catch (error) {
    console.error("Error creating leave:", error);
    return res.status(500).json({
      status: 500,
      message: "Server error while creating leave",
      details: error.message,
    });
  }
};

export const updateLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId, leaveType, startDate, endDate, status, reason } = req.body;
    const missingFields = [];

    // Validate Employee ID
    const employeeValidation = validateEmployeeId(employeeId);
    if (!employeeValidation.valid) {
      missingFields.push({ name: "employeeId", message: employeeValidation.message });
    }

    // Validate Leave Type
    const leaveTypeValidation = validateLeaveType(leaveType);
    if (!leaveTypeValidation.valid) {
      missingFields.push({ name: "leaveType", message: leaveTypeValidation.message });
    }

    // Validate Start Date
    const startDateValidation = validateDate(startDate, "Start date");
    if (!startDateValidation.valid) {
      missingFields.push({ name: "startDate", message: startDateValidation.message });
    }

    // Validate End Date
    const endDateValidation = validateDate(endDate, "End date");
    if (!endDateValidation.valid) {
      missingFields.push({ name: "endDate", message: endDateValidation.message });
    }

    // Validate Date Range (only if both dates are valid)
    if (startDateValidation.valid && endDateValidation.valid) {
      const dateRangeValidation = validateDateRange(startDate, endDate);
      if (!dateRangeValidation.valid) {
        missingFields.push({ name: "endDate", message: dateRangeValidation.message });
      }
    }

    // Validate Status
    const statusValidation = validateStatus(status);
    if (!statusValidation.valid) {
      missingFields.push({ name: "status", message: statusValidation.message });
    }

    // Validate Reason
    const reasonValidation = validateReason(reason);
    if (!reasonValidation.valid) {
      missingFields.push({ name: "reason", message: reasonValidation.message });
    }

    // Return all validation errors
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Validation failed. Please correct the errors.",
        missingFields,
      });
    }

    // Check if leave exists
    const leave = await Leave.findById(id);
    if (!leave) {
      return res.status(404).json({
        status: 404,
        message: "Leave not found",
      });
    }

    // Check for overlapping leaves (excluding current leave)
    const overlappingLeave = await Leave.findOne({
      _id: { $ne: id },
      employeeId: employeeId.trim(),
      isArchived: false,
      $or: [
        {
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(startDate) }
        }
      ]
    });

    if (overlappingLeave) {
      return res.status(400).json({
        status: 400,
        message: "Leave request overlaps with an existing leave period",
        missingFields: [
          { 
            name: "startDate", 
            message: "This leave period conflicts with an existing leave request" 
          }
        ],
      });
    }

    req.oldData = leave.toObject();

    // Update fields
    leave.employeeId = employeeId.trim();
    leave.leaveType = leaveType.trim();
    leave.startDate = new Date(startDate);
    leave.endDate = new Date(endDate);
    leave.status = status.trim();
    leave.reason = reason.trim();

    const updatedLeave = await leave.save();

    await logActivity(
      req.user._id,
      "Leaves",
      "UPDATE",
      req.oldData,
      updatedLeave.toObject(),
      req
    );

    return res.status(200).json({
      status: 200,
      message: "Leave updated successfully",
      data: updatedLeave,
    });
  } catch (error) {
    console.error("Error updating leave:", error);
    return res.status(500).json({
      status: 500,
      message: "Server error while updating leave",
      details: error.message,
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
      message: "Active leaves fetched successfully",
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

    const leaves = await Leave.find({ isArchived: true })
      .populate("employeeId", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Leave.countDocuments({ isArchived: true });

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
    
    if (!leave) {
      return res.status(404).json({ 
        status: 404,
        error: "Leave not found" 
      });
    }

    req.oldData = leave.toObject();

    leave.isArchived = true;
    await leave.save();

    await logActivity(req.user._id, "Leaves", "DELETE", req.oldData, null, req);

    return res.status(200).json({
      status: 200,
      message: "Leave archived successfully",
    });
  } catch (error) {
    console.error("Error archiving leave:", error);
    return res.status(500).json({ 
      status: 500,
      error: error.message 
    });
  }
};