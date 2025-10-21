const Fine = require("../Models/fineModel");
const Employee = require("../Models/employeeModel");

// ✅ CREATE FINE
const createFine = async (req, res) => {
  const { fineId, employeeId, fineType, fineAmount, fineDate, description, status, archiveFine } = req.body;

  // Validation
  if (!fineId) return res.json({ error: "Fine ID is required" });
  if (!employeeId) return res.json({ error: "Employee ID is required" });
  if (!fineType) return res.json({ error: "Fine Type is required" });
  if (fineAmount === undefined || fineAmount === null) return res.json({ error: "Fine Amount is required" });

  try {
    // Check if employee exists
    const employeeExists = await Employee.findById(employeeId);
    if (!employeeExists) return res.json({ error: "Employee not found" });

    // Check if fine already exists
    const exists = await Fine.findOne({ fineId });
    if (exists) return res.json({ error: "Fine with this ID already exists!" });

    // Create fine record
    const fine = await Fine.create({
      fineId,
      employeeId,
      fineType,
      fineAmount,
      fineDate,
      description,
      status,
      archiveFine,
    });

    return res.status(200).json({
      message: "Fine record created successfully",
      data: fine,
    });
  } catch (error) {
    return res.status(500).json({ error: "Server Error", details: error.message });
  }
};

// ✅ GET ALL FINES (non-archived)
const getFineList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filter = { archiveFine: false };

    const fines = await Fine.find(filter)
      .populate("employeeId", "firstName lastName email")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const totalFines = await Fine.countDocuments(filter);

    return res.status(200).json({
      message: "Fine list fetched successfully",
      totalFines,
      totalPages: Math.ceil(totalFines / limit),
      currentPage: page,
      limit,
      data: fines,
    });
  } catch (error) {
    return res.status(500).json({ error: "Server Error", details: error.message });
  }
};

// ✅ GET ARCHIVED FINES
const getArchivedFines = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filter = { archiveFine: true };

    const archived = await Fine.find(filter)
      .populate("employeeId", "firstName lastName email")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const totalArchived = await Fine.countDocuments(filter);

    return res.status(200).json({
      message: "Archived fines fetched successfully",
      totalArchived,
      totalPages: Math.ceil(totalArchived / limit),
      currentPage: page,
      limit,
      data: archived,
    });
  } catch (error) {
    return res.status(500).json({ error: "Server Error", details: error.message });
  }
};

// ✅ UPDATE FINE
const updateFine = async (req, res) => {
  try {
    const { id } = req.params;
    const { fineId, employeeId, fineType, fineAmount, fineDate, description, status, archiveFine } = req.body;

    const fine = await Fine.findById(id);
    if (!fine) return res.status(404).json({ error: "Fine not found" });

    fine.fineId = fineId || fine.fineId;
    fine.employeeId = employeeId || fine.employeeId;
    fine.fineType = fineType || fine.fineType;
    fine.fineAmount = fineAmount ?? fine.fineAmount;
    fine.fineDate = fineDate || fine.fineDate;
    fine.description = description || fine.description;
    fine.status = status || fine.status;
    fine.archiveFine = archiveFine ?? fine.archiveFine;

    const updated = await fine.save();

    return res.status(200).json({
      message: "Fine updated successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ✅ ARCHIVE (SOFT DELETE) FINE
const deleteFine = async (req, res) => {
  try {
    const { id } = req.params;
    const fine = await Fine.findById(id);

    if (!fine) return res.status(404).json({ error: "Fine not found" });

    fine.archiveFine = true;
    await fine.save();

    return res.status(200).json({
      message: "Fine archived successfully",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createFine,
  getFineList,
  getArchivedFines,
  updateFine,
  deleteFine,
};
