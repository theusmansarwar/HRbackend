import Attendance from "../Models/attendanceModel.js";
import Employee from "../Models/employeeModel.js";
import { logActivity } from "../utils/activityLogger.js";

// ✅ PROFESSIONAL VALIDATION HELPERS
const ValidationRules = {
  // Status validation
  status: {
    allowedValues: ['Present', 'Absent', 'Leave', 'Half Day', 'Work From Home', 'present', 'absent', 'leave', 'half day', 'work from home'],
    message: "Status must be one of: Present, Absent, Leave, Half Day, or Work From Home",
  },
  
  // Shift Name validation
  shiftName: {
    pattern: /^[a-zA-Z0-9\s\-]+$/,
    minLength: 2,
    maxLength: 50,
    message: "Shift name must contain only letters, numbers, spaces, and hyphens (2-50 characters)",
  },
  
  // Overtime Hours validation
  overtimeHours: {
    min: 0,
    max: 24,
    message: "Overtime hours must be between 0 and 24",
  },
  
  // Time validation
  time: {
    pattern: /^([01]\d|2[0-3]):([0-5]\d)$/,
    message: "Time must be in HH:MM format (24-hour)",
  },
};

// Validate status
const validateStatus = (status) => {
  if (!status || !status.trim()) {
    return { valid: false, message: "Status is required" };
  }
  
  const trimmedStatus = status.trim();
  
  if (!ValidationRules.status.allowedValues.map(v => v.toLowerCase()).includes(trimmedStatus.toLowerCase())) {
    return { valid: false, message: ValidationRules.status.message };
  }
  
  // Normalize to proper capitalization
  const normalizedStatus = trimmedStatus
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  return { valid: true, value: normalizedStatus };
};

// Validate shift name
const validateShiftName = (shiftName) => {
  if (!shiftName || !shiftName.trim()) {
    return { valid: false, message: "Shift name is required" };
  }
  
  const trimmedShiftName = shiftName.trim();
  
  if (trimmedShiftName.length < ValidationRules.shiftName.minLength) {
    return { valid: false, message: `Shift name must be at least ${ValidationRules.shiftName.minLength} characters` };
  }
  
  if (trimmedShiftName.length > ValidationRules.shiftName.maxLength) {
    return { valid: false, message: `Shift name must not exceed ${ValidationRules.shiftName.maxLength} characters` };
  }
  
  if (!ValidationRules.shiftName.pattern.test(trimmedShiftName)) {
    return { valid: false, message: ValidationRules.shiftName.message };
  }
  
  return { valid: true, value: trimmedShiftName };
};

// Validate overtime hours
const validateOvertimeHours = (overtimeHours) => {
  if (overtimeHours === undefined || overtimeHours === null || overtimeHours === "") {
    return { valid: false, message: "Overtime hours are required" };
  }
  
  const hours = Number(overtimeHours);
  
  if (isNaN(hours)) {
    return { valid: false, message: "Overtime hours must be a valid number" };
  }
  
  if (hours < ValidationRules.overtimeHours.min) {
    return { valid: false, message: `Overtime hours cannot be negative` };
  }
  
  if (hours > ValidationRules.overtimeHours.max) {
    return { valid: false, message: `Overtime hours cannot exceed ${ValidationRules.overtimeHours.max} hours` };
  }
  
  // Round to 2 decimal places
  const roundedHours = Math.round(hours * 100) / 100;
  
  return { valid: true, value: roundedHours };
};

// Validate time format
const validateTime = (time, fieldName = "Time") => {
  if (!time || !time.trim()) {
    return { valid: false, message: `${fieldName} is required` };
  }
  
  const trimmedTime = time.trim();
  
  if (!ValidationRules.time.pattern.test(trimmedTime)) {
    return { valid: false, message: `${fieldName} must be in HH:MM format (e.g., 09:00, 17:30)` };
  }
  
  return { valid: true, value: trimmedTime };
};

// Validate time range (check-in should be before check-out)
const validateTimeRange = (checkInTime, checkOutTime) => {
  const [checkInHour, checkInMinute] = checkInTime.split(':').map(Number);
  const [checkOutHour, checkOutMinute] = checkOutTime.split(':').map(Number);
  
  const checkInMinutes = checkInHour * 60 + checkInMinute;
  const checkOutMinutes = checkOutHour * 60 + checkOutMinute;
  
  if (checkInMinutes >= checkOutMinutes) {
    return { valid: false, message: "Check-out time must be after check-in time" };
  }
  
  return { valid: true };
};

// Validate employee ID
const validateEmployeeId = async (employeeId) => {
  if (!employeeId || !employeeId.trim()) {
    return { valid: false, message: "Employee is required" };
  }
  
  const employee = await Employee.findById(employeeId.trim());
  if (!employee) {
    return { valid: false, message: "Selected employee does not exist" };
  }
  
  return { valid: true, value: employeeId.trim() };
};

// =============================
// CREATE ATTENDANCE WITH VALIDATION
// =============================
export const createAttendance = async (req, res) => {
  try {
    const { employeeId, status, checkInTime, checkOutTime, shiftName, overtimeHours } = req.body;
    const missingFields = [];

    // Validate Employee ID
    const employeeValidation = await validateEmployeeId(employeeId);
    if (!employeeValidation.valid) {
      missingFields.push({ name: "employeeId", message: employeeValidation.message });
    }

    // Validate Status
    const statusValidation = validateStatus(status);
    if (!statusValidation.valid) {
      missingFields.push({ name: "status", message: statusValidation.message });
    }

    // Validate Check-In Time
    const checkInValidation = validateTime(checkInTime, "Check-in time");
    if (!checkInValidation.valid) {
      missingFields.push({ name: "checkInTime", message: checkInValidation.message });
    }

    // Validate Check-Out Time
    const checkOutValidation = validateTime(checkOutTime, "Check-out time");
    if (!checkOutValidation.valid) {
      missingFields.push({ name: "checkOutTime", message: checkOutValidation.message });
    }

    // Validate Time Range (only if both times are valid)
    if (checkInValidation.valid && checkOutValidation.valid) {
      const timeRangeValidation = validateTimeRange(checkInValidation.value, checkOutValidation.value);
      if (!timeRangeValidation.valid) {
        missingFields.push({ name: "checkOutTime", message: timeRangeValidation.message });
      }
    }

    // Validate Shift Name
    const shiftNameValidation = validateShiftName(shiftName);
    if (!shiftNameValidation.valid) {
      missingFields.push({ name: "shiftName", message: shiftNameValidation.message });
    }

    // Validate Overtime Hours
    const overtimeValidation = validateOvertimeHours(overtimeHours);
    if (!overtimeValidation.valid) {
      missingFields.push({ name: "overtimeHours", message: overtimeValidation.message });
    }

    // Return validation errors
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Validation failed. Please correct the errors.",
        missingFields,
      });
    }

    // Generate Attendance ID
    const lastAttendance = await Attendance.findOne().sort({ createdAt: -1 });
    let newIdNumber = 1;
    if (lastAttendance?.attendanceId) {
      const lastNumber = parseInt(lastAttendance.attendanceId.split("-")[1]);
      if (!isNaN(lastNumber)) newIdNumber = lastNumber + 1;
    }
    const attendanceId = `ATT-${newIdNumber.toString().padStart(4, "0")}`;

    const attendance = new Attendance({
      attendanceId,
      employeeId: employeeValidation.value,
      status: statusValidation.value,
      checkInTime: checkInValidation.value,
      checkOutTime: checkOutValidation.value,
      shiftName: shiftNameValidation.value,
      overtimeHours: overtimeValidation.value,
    });

    await attendance.save();

    await logActivity(
      req.user._id,
      "Attendance",
      "CREATE",
      null,
      attendance.toObject(),
      req
    );

    return res.status(201).json({
      status: 201,
      message: "Attendance created successfully",
      data: attendance,
    });
  } catch (error) {
    console.error("Error creating attendance:", error);
    return res.status(500).json({
      status: 500,
      message: "Server error while creating attendance",
      details: error.message,
    });
  }
};

// =============================
// UPDATE ATTENDANCE WITH VALIDATION
// =============================
export const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId, status, checkInTime, checkOutTime, shiftName, overtimeHours } = req.body;
    const missingFields = [];

    // Validate Employee ID
    const employeeValidation = await validateEmployeeId(employeeId);
    if (!employeeValidation.valid) {
      missingFields.push({ name: "employeeId", message: employeeValidation.message });
    }

    // Validate Status
    const statusValidation = validateStatus(status);
    if (!statusValidation.valid) {
      missingFields.push({ name: "status", message: statusValidation.message });
    }

    // Validate Check-In Time
    const checkInValidation = validateTime(checkInTime, "Check-in time");
    if (!checkInValidation.valid) {
      missingFields.push({ name: "checkInTime", message: checkInValidation.message });
    }

    // Validate Check-Out Time
    const checkOutValidation = validateTime(checkOutTime, "Check-out time");
    if (!checkOutValidation.valid) {
      missingFields.push({ name: "checkOutTime", message: checkOutValidation.message });
    }

    // Validate Time Range (only if both times are valid)
    if (checkInValidation.valid && checkOutValidation.valid) {
      const timeRangeValidation = validateTimeRange(checkInValidation.value, checkOutValidation.value);
      if (!timeRangeValidation.valid) {
        missingFields.push({ name: "checkOutTime", message: timeRangeValidation.message });
      }
    }

    // Validate Shift Name
    const shiftNameValidation = validateShiftName(shiftName);
    if (!shiftNameValidation.valid) {
      missingFields.push({ name: "shiftName", message: shiftNameValidation.message });
    }

    // Validate Overtime Hours
    const overtimeValidation = validateOvertimeHours(overtimeHours);
    if (!overtimeValidation.valid) {
      missingFields.push({ name: "overtimeHours", message: overtimeValidation.message });
    }

    // Return validation errors
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Validation failed. Please correct the errors.",
        missingFields,
      });
    }

    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return res.status(404).json({
        status: 404,
        message: "Attendance record not found",
      });
    }

    req.oldData = attendance.toObject();

    attendance.employeeId = employeeValidation.value;
    attendance.status = statusValidation.value;
    attendance.checkInTime = checkInValidation.value;
    attendance.checkOutTime = checkOutValidation.value;
    attendance.shiftName = shiftNameValidation.value;
    attendance.overtimeHours = overtimeValidation.value;

    const updatedAttendance = await attendance.save();

    await logActivity(
      req.user._id,
      "Attendance",
      "UPDATE",
      req.oldData,
      updatedAttendance.toObject(),
      req
    );

    return res.status(200).json({
      status: 200,
      message: "Attendance updated successfully",
      data: updatedAttendance,
    });
  } catch (error) {
    console.error("Error updating attendance:", error);

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

    return res.status(500).json({
      status: 500,
      message: "Server error while updating attendance",
      details: error.message,
    });
  }
};

// =============================
// GET ACTIVE ATTENDANCE LIST
// =============================
export const getAttendanceList = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const search = req.query.search?.trim() || "";
    const skip = (page - 1) * limit;

    const baseFilter = { isArchived: false };

    if (search) {
      const regex = new RegExp(search, "i");
      const employees = await Employee.find({
        $or: [
          { firstName: regex },
          { lastName: regex },
          { email: regex },
          { employeeId: regex },
        ],
      }).select("_id");

      const employeeIds = employees.map((emp) => emp._id);

      baseFilter.$or = [
        { status: regex },
        { shiftName: regex },
        { attendanceId: regex },
        { employeeId: { $in: employeeIds } },
      ];
    }

    const attendanceList = await Attendance.find(baseFilter)
      .populate("employeeId", "firstName lastName email employeeId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Attendance.countDocuments(baseFilter);

    return res.status(200).json({
      status: 200,
      message: "Active attendance records fetched successfully",
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
      data: attendanceList,
    });
  } catch (error) {
    console.error("Error fetching attendance list:", error);
    return res.status(500).json({
      status: 500,
      message: "Server error while fetching attendance list",
    });
  }
};

// =============================
// GET ARCHIVED ATTENDANCE
// =============================
export const getArchivedAttendances = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const attendanceList = await Attendance.find({ isArchived: true })
      .populate("employeeId", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Attendance.countDocuments({ isArchived: true });

    return res.status(200).json({
      status: 200,
      message: "Archived attendance records fetched successfully",
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
      data: attendanceList,
    });
  } catch (error) {
    console.error("Error fetching archived attendance:", error);
    return res.status(500).json({
      status: 500,
      message: "Server error while fetching archived attendance",
    });
  }
};

// =============================
// GET ATTENDANCE BY ID
// =============================
export const getAttendanceById = async (req, res) => {
  try {
    const { id } = req.params;
    const attendance = await Attendance.findById(id).populate("employeeId", "firstName lastName email");

    if (!attendance) {
      return res.status(404).json({
        status: 404,
        message: "Attendance not found",
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Attendance fetched successfully",
      data: attendance,
    });
  } catch (error) {
    console.error("Error fetching attendance by ID:", error);
    return res.status(500).json({
      status: 500,
      message: "Server error while fetching attendance",
    });
  }
};

// =============================
// DELETE (ARCHIVE) ATTENDANCE
// =============================
export const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const attendance = await Attendance.findById(id);
    
    if (!attendance) {
      return res.status(404).json({
        status: 404,
        message: "Attendance not found",
      });
    }

    req.oldData = attendance.toObject();

    attendance.isArchived = true;
    await attendance.save();

    await logActivity(req.user._id, "Attendance", "DELETE", req.oldData, null, req);

    return res.status(200).json({
      status: 200,
      message: "Attendance archived successfully",
    });
  } catch (error) {
    console.error("Error archiving attendance:", error);
    return res.status(500).json({
      status: 500,
      message: "Server error while archiving attendance",
      details: error.message,
    });
  }
};