// controllers/attendanceController.js
import mongoose from "mongoose";
import Attendance from "../Models/attendanceModel.js";
import Employee from "../Models/employeeModel.js";
 

// =============================
// CREATE ATTENDANCE
// =============================
export const createAttendance = async (req, res) => {
  try {
    const {
      employeeId,
      status,
      checkInTime,
      checkOutTime,
      shiftName,
      overtimeHours,
    } = req.body;

    const missingFields = [];

    if (!employeeId)
      missingFields.push({ name: "employeeId", message: "Employee is required" });
    if (!status)
      missingFields.push({ name: "status", message: "Status is required" });
    if (!checkInTime)
      missingFields.push({ name: "checkInTime", message: "Check-in Time is required" });
    if (!checkOutTime)
      missingFields.push({ name: "checkOutTime", message: "Check-out Time is required" });
    if (!shiftName)
      missingFields.push({ name: "shiftName", message: "Shift Name is required" });
    if (overtimeHours === undefined || overtimeHours === null || overtimeHours === "")
      missingFields.push({ name: "overtimeHours", message: "Overtime Hours are required" });

    // 🔴 If missing any required fields
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Validation failed. Some fields are missing.",
        missingFields,
      });
    }

    // ✅ Check valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ status: 400, message: "Invalid Employee ID format" });
    }

    // ✅ Check if employee exists
    const employeeExists = await Employee.findById(employeeId);
    if (!employeeExists) {
      return res.status(404).json({ status: 404, message: "Employee not found" });
    }

    // ✅ Generate unique Attendance ID (like ATT-0001)
    const lastAttendance = await Attendance.findOne().sort({ createdAt: -1 });
    let newIdNumber = 1;
    if (lastAttendance?.attendanceId) {
      const lastNumber = parseInt(lastAttendance.attendanceId.split("-")[1]);
      newIdNumber = lastNumber + 1;
    }
    const attendanceId = `ATT-${newIdNumber.toString().padStart(4, "0")}`;

    // ✅ Create Attendance Record
    const attendance = await Attendance.create({
      attendanceId,
      employeeId,
      status,
      checkInTime,
      checkOutTime,
      shiftName,
      overtimeHours,
    });

    return res.status(201).json({
      status: 201,
      message: "Attendance created successfully ✅",
      data: attendance,
    });
  } catch (error) {
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
    const {
      employeeId,
      status,
      checkInTime,
      checkOutTime,
      shiftName,
      overtimeHours,
    } = req.body;

    const missingFields = [];

    if (!employeeId)
      missingFields.push({ name: "employeeId", message: "Employee is required" });
    if (!status)
      missingFields.push({ name: "status", message: "Status is required" });
    if (!checkInTime)
      missingFields.push({ name: "checkInTime", message: "Check-in Time is required" });
    if (!checkOutTime)
      missingFields.push({ name: "checkOutTime", message: "Check-out Time is required" });
    if (!shiftName)
      missingFields.push({ name: "shiftName", message: "Shift Name is required" });
    if (overtimeHours === undefined || overtimeHours === null || overtimeHours === "")
      missingFields.push({ name: "overtimeHours", message: "Overtime Hours are required" });

    // 🔴 If missing any required fields
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Validation failed. Some fields are missing.",
        missingFields,
      });
    }

    // ✅ Validate employeeId format
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ status: 400, message: "Invalid Employee ID format" });
    }

    // ✅ Check if attendance record exists
    const attendanceRecord = await Attendance.findById(id);
    if (!attendanceRecord) {
      return res.status(404).json({ status: 404, message: "Attendance record not found" });
    }

    // ✅ Check if employee exists
    const employeeExists = await Employee.findById(employeeId);
    if (!employeeExists) {
      return res.status(404).json({ status: 404, message: "Employee not found" });
    }

    // ✅ Update Attendance Record
    const updatedAttendance = await Attendance.findByIdAndUpdate(
      id,
      {
        employeeId,
        status,
        checkInTime,
        checkOutTime,
        shiftName,
        overtimeHours,
      },
      { new: true }
    ).populate("employeeId", "firstName lastName email");

    return res.status(200).json({
      status: 200,
      message: "Attendance updated successfully ✅",
      data: updatedAttendance,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Server error while updating attendance",
      details: error.message,
    });
  }
};


// READ ACTIVE ATTENDANCE LIST (with pagination + populate)
export const getAttendanceList = async (req, res) => {
  try {
    // Extract query parameters safely
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const search = req.query.search?.trim() || "";

    // Base filter for non-archived attendance records
    const baseFilter = { isArchived: false };

    // Fetch attendance records with populated employee info
    let attendanceList = await Attendance.find(baseFilter)
      .populate("employeeId", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Apply manual search filtering (post-populate)
    if (search) {
      const regex = new RegExp(search, "i");
      attendanceList = attendanceList.filter(
        (record) =>
          regex.test(record.attendanceDate || "") ||
          regex.test(record.status || "") ||
          regex.test(record.employeeId?.firstName || "") ||
          regex.test(record.employeeId?.lastName || "") ||
          regex.test(record.employeeId?.email || "")
      );
    }

    // Get total count for pagination
    const total = await Attendance.countDocuments(baseFilter);

    // Send structured response
    return res.status(200).json({
      message: "Active attendance list fetched successfully ✅",
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
      data: attendanceList,
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return res.status(500).json({ error: "Server Error" });
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
