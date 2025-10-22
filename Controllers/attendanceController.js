// controllers/attendanceController.js
import mongoose from "mongoose";
import Attendance from "../Models/attendanceModel.js";

// CREATE ATTENDANCE
export const createAttendance = async (req, res) => {
  try {
    const { employeeId, date, status, checkInTime, checkOutTime, shiftName, overtimeHours } = req.body;

    // Validations
    if (!employeeId) return res.status(400).json({ error: "EmployeeId is required" });
    if (!date) return res.status(400).json({ error: "Date is required" });
    if (!status) return res.status(400).json({ error: "Status is required" });
    if (!checkInTime) return res.status(400).json({ error: "Check In Time is required" });
    if (!checkOutTime) return res.status(400).json({ error: "Check Out Time is required" });
    if (!shiftName) return res.status(400).json({ error: "Shift Name is required" });
    if (overtimeHours === undefined || overtimeHours === null) return res.status(400).json({ error: "Overtime Hours is required" });

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ error: "Invalid employeeId format" });
    }

    // Generate unique attendanceId like "ATT-0001"
    const lastAttendance = await Attendance.findOne().sort({ createdAt: -1 });
    let newIdNumber = 1;
    if (lastAttendance && lastAttendance.attendanceId) {
      const lastNumber = parseInt(lastAttendance.attendanceId.split("-")[1]);
      newIdNumber = lastNumber + 1;
    }
    const attendanceId = `ATT-${newIdNumber.toString().padStart(4, "0")}`;

    const attendanceCreated = await Attendance.create({
      attendanceId,
      employeeId,
      date,
      status,
      checkInTime,
      checkOutTime,
      shiftName,
      overtimeHours,
    });

    return res.status(201).json({
      status: 201,
      message: "Attendance created successfully",
      data: attendanceCreated,
    });
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Server Error", details: error.message });
  }
};

// READ ACTIVE ATTENDANCE LIST (with pagination + populate)
export const getAttendanceList = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const total = await Attendance.countDocuments({ isArchived: false });
    const attendanceList = await Attendance.find({ isArchived: false })
      .populate("employeeId", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    return res.status(200).json({
      message: "Active attendance list fetched",
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      data: attendanceList,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// READ ARCHIVED ATTENDANCE LIST (with pagination + populate)
export const getArchivedAttendances = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const total = await Attendance.countDocuments({ isArchived: true });
    const archivedList = await Attendance.find({ isArchived: true })
      .populate("employeeId", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    return res.status(200).json({
      message: "Archived attendance list fetched",
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      data: archivedList,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// GET SINGLE ATTENDANCE BY ID (with populate)
export const getAttendanceById = async (req, res) => {
  try {
    const { id } = req.params;

    const attendance = await Attendance.findById(id).populate("employeeId", "firstName lastName email");
    if (!attendance) return res.status(404).json({ error: "Attendance not found" });

    return res.status(200).json({ message: "Attendance fetched successfully", data: attendance });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// UPDATE ATTENDANCE
export const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId, date, status, checkInTime, checkOutTime, shiftName, overtimeHours } = req.body;

    const attendance = await Attendance.findById(id);
    if (!attendance) return res.status(404).json({ error: "Attendance not found" });

    attendance.employeeId = employeeId;
    attendance.date = date;
    attendance.status = status;
    attendance.checkInTime = checkInTime;
    attendance.checkOutTime = checkOutTime;
    attendance.shiftName = shiftName;
    attendance.overtimeHours = overtimeHours;

    const updatedAttendance = await attendance.save();

    return res.status(200).json({ message: "Attendance updated successfully", data: updatedAttendance });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// SOFT DELETE ATTENDANCE
export const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const attendance = await Attendance.findById(id);
    if (!attendance) return res.status(404).json({ error: "Attendance not found" });

    attendance.isArchived = true;
    await attendance.save();

    return res.status(200).json({ message: "Attendance archived successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
