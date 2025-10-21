const mongoose = require("mongoose");
const Attendance = require("../Models/attendanceModel");

// CREATE ATTENDANCE
const createAttendance = async (req, res) => {
  const {
    employeeId,
    date,
    status,
    checkInTime,
    checkOutTime,
    shiftName,
    overtimeHours,
  } = req.body;

  // Required field checks
  if (!employeeId) return res.status(400).json({ error: "EmployeeId is required" });
  if (!date) return res.status(400).json({ error: "Date is required" });
  if (!status) return res.status(400).json({ error: "Status is required" });
  if (!checkInTime) return res.status(400).json({ error: "Check In Time is required" });
  if (!checkOutTime) return res.status(400).json({ error: "Check Out Time is required" });
  if (!shiftName) return res.status(400).json({ error: "Shift Name is required" });
  if (overtimeHours === undefined || overtimeHours === null) {
    return res.status(400).json({ error: "Overtime Hours is required" });
  }

  if (!mongoose.Types.ObjectId.isValid(employeeId)) {
    return res.status(400).json({ error: "Invalid employeeId format" });
  }

  try {
    const attendanceExists = await Attendance.findOne({ employeeId, date });
    if (attendanceExists) {
      return res.status(400).json({
        error: "Attendance for this employee already exists on this date",
      });
    }

    const attendanceCreated = await Attendance.create({
      employeeId,
      date,
      status,
      checkInTime,
      checkOutTime,
      shiftName,
      overtimeHours,
    });

    return res.status(201).json({
      message: "Attendance Created",
      data: attendanceCreated,
    });
  } catch (error) {
    console.error("Create Attendance Error:", error.message);
    return res.status(500).json({ error: "Server Error" });
  }
};

// READ ATTENDANCE LIST WITH PAGINATION
const getAttendanceList = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const total = await Attendance.countDocuments({ isArchived: false });
    const attendanceList = await Attendance.find({ isArchived: false })
      .populate("employeeId")
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({
      message: "Attendance List Fetched",
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      data: attendanceList,
    });
  } catch (error) {
    console.error("Get Attendance Error:", error.message);
    return res.status(500).json({ error: "Server Error" });
  }
};

// LIST ARCHIVED ATTENDANCES
const getArchivedAttendances = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const total = await Attendance.countDocuments({ isArchived: true });
    const archivedList = await Attendance.find({ isArchived: true })
      .populate("employeeId")
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({
      message: "Archived Attendances",
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      data: archivedList,
    });
  } catch (error) {
    console.error("Get Archived Error:", error.message);
    return res.status(500).json({ error: "Server Error" });
  }
};

// UPDATE ATTENDANCE
const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      employeeId,
      date,
      status,
      checkInTime,
      checkOutTime,
      shiftName,
      overtimeHours,
    } = req.body;

    if (!employeeId) return res.status(400).json({ error: "EmployeeId is required" });
    if (!date) return res.status(400).json({ error: "Date is required" });
    if (!status) return res.status(400).json({ error: "Status is required" });
    if (!checkInTime) return res.status(400).json({ error: "Check In Time is required" });
    if (!checkOutTime) return res.status(400).json({ error: "Check Out Time is required" });
    if (!shiftName) return res.status(400).json({ error: "Shift Name is required" });
    if (overtimeHours === undefined || overtimeHours === null) {
      return res.status(400).json({ error: "Overtime Hours is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ error: "Invalid employeeId format" });
    }

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

    return res.status(200).json({
      message: "Attendance updated successfully",
      data: updatedAttendance,
    });
  } catch (error) {
    console.error("Update Attendance Error:", error.message);
    return res.status(500).json({ error: "Server Error" });
  }
};

// SOFT DELETE (ARCHIVE)
const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const attendance = await Attendance.findById(id);
    if (!attendance) return res.status(404).json({ error: "Attendance not found" });

    attendance.isArchived = true;
    await attendance.save();

    return res.status(200).json({ message: "Attendance archived successfully" });
  } catch (error) {
    console.error("Delete Attendance Error:", error.message);
    return res.status(500).json({ error: "Server Error" });
  }
};

module.exports = {
  createAttendance,
  getAttendanceList,
  getArchivedAttendances,
  updateAttendance,
  deleteAttendance,
};
