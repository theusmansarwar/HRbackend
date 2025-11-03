import Attendance from "../Models/attendanceModel.js";
import Employee from "../Models/employeeModel.js";
import { logActivity } from "../utils/activityLogger.js";

// =============================
// CREATE ATTENDANCE
// =============================
export const createAttendance = async (req, res) => {
  try {
    const { employeeId, status, checkInTime, checkOutTime, shiftName, overtimeHours } = req.body;

    const missingFields = [];

    if (!employeeId)
      missingFields.push({ name: "employeeId", message: "Employee is required" });
    if (!status)
      missingFields.push({ name: "status", message: "Status is required" });
    if (!checkInTime)
      missingFields.push({ name: "checkInTime", message: "Check-in time is required" });
    if (!checkOutTime)
      missingFields.push({ name: "checkOutTime", message: "Check-out time is required" });
    if (!shiftName)
      missingFields.push({ name: "shiftName", message: "Shift name is required" });
    if (overtimeHours === undefined || overtimeHours === null || overtimeHours === "")
      missingFields.push({ name: "overtimeHours", message: "Overtime hours are required" });

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Missing required fields",
        missingFields,
      });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        status: 404,
        message: "Employee not found",
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
      employeeId,
      status,
      checkInTime,
      checkOutTime,
      shiftName,
      overtimeHours,
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
// UPDATE ATTENDANCE
// =============================
export const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId, status, checkInTime, checkOutTime, shiftName, overtimeHours } = req.body;

    const missingFields = [];

    if (!employeeId)
      missingFields.push({ name: "employeeId", message: "Employee is required" });
    if (!status)
      missingFields.push({ name: "status", message: "Status is required" });
    if (!checkInTime)
      missingFields.push({ name: "checkInTime", message: "Check-in time is required" });
    if (!checkOutTime)
      missingFields.push({ name: "checkOutTime", message: "Check-out time is required" });
    if (!shiftName)
      missingFields.push({ name: "shiftName", message: "Shift name is required" });
    if (overtimeHours === undefined || overtimeHours === null || overtimeHours === "")
      missingFields.push({ name: "overtimeHours", message: "Overtime hours are required" });

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Missing required fields",
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

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        status: 404,
        message: "Employee not found",
      });
    }

    req.oldData = attendance.toObject();

    attendance.employeeId = employeeId;
    attendance.status = status;
    attendance.checkInTime = checkInTime;
    attendance.checkOutTime = checkOutTime;
    attendance.shiftName = shiftName;
    attendance.overtimeHours = overtimeHours;

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

    const baseFilter = { isArchived: false };

    let attendanceList = await Attendance.find(baseFilter)
      .populate("employeeId", "firstName lastName email employeeId")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    if (search) {
      const regex = new RegExp(search, "i");
      attendanceList = attendanceList.filter(
        (att) =>
          regex.test(att.status || "") ||
          regex.test(att.shiftName || "") ||
          regex.test(att.employeeId?.firstName || "") ||
          regex.test(att.employeeId?.lastName || "") ||
          regex.test(att.employeeId?.email || "")
      );
    }

    const total = await Attendance.countDocuments(baseFilter);

    return res.status(200).json({
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
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const attendanceList = await Attendance.find({ isArchived: true })
      .populate("employeeId", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Attendance.countDocuments({ isArchived: true });

    return res.status(200).json({
      message: "Archived attendance records fetched successfully",
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      data: attendanceList,
    });
  } catch (error) {
    console.error("Error fetching archived attendance:", error);
    return res.status(500).json({ status: 500, message: error.message });
  }
};

// =============================
// GET ATTENDANCE BY ID
// =============================
export const getAttendanceById = async (req, res) => {
  try {
    const { id } = req.params;
    const attendance = await Attendance.findById(id).populate("employeeId", "firstName lastName email");

    if (!attendance)
      return res.status(404).json({ status: 404, message: "Attendance not found" });

    return res.status(200).json({
      status: 200,
      message: "Attendance fetched successfully",
      data: attendance,
    });
  } catch (error) {
    console.error("Error fetching attendance by ID:", error);
    return res.status(500).json({ status: 500, message: error.message });
  }
};

// =============================
// DELETE (ARCHIVE) ATTENDANCE
// =============================
export const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const attendance = await Attendance.findById(id);
    if (!attendance) return res.status(404).json({ error: "Attendance not found" });

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
