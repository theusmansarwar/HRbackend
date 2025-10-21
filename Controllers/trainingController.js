const Training = require("../Models/trainingModel");

// CREATE TRAINING
const createTraining = async (req, res) => {
  try {
    const { employeeId, trainingName, startDate, endDate, status } = req.body;
    const certificate = req.file?.filename || null; 

    if (!employeeId) return res.json({ error: "EmployeeId is required" });
    if (!trainingName) return res.json({ error: "Training Name is required" });
    if (!startDate) return res.json({ error: "Start Date is required" });
    if (!endDate) return res.json({ error: "End Date is required" });
    if (!status) return res.json({ error: "Status is required" });

    const training = await Training.create({
      employeeId,
      trainingName,
      startDate,
      endDate,
      certificate,
      status,
    });

    return res.json({
      status: 200,
      message: "Training created successfully",
      data: training,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getTrainingList = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const trainings = await Training.find({ archive: false })
      .populate("employeeId")
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Training.countDocuments({ archive: false });

    return res.status(200).json({
      message: "Active training list fetched",
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      data: trainings,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getArchivedTrainings = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const trainings = await Training.find({ archive: true })
      .populate("employeeId")
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Training.countDocuments({ archive: true });

    return res.status(200).json({
      message: "Archived training list fetched",
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      data: trainings,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getTrainingById = async (req, res) => {
  try {
    const { id } = req.params;
    const training = await Training.findById(id).populate("employeeId");

    if (!training) return res.status(404).json({ error: "Training not found" });

    return res.status(200).json({
      message: "Training fetched successfully",
      data: training,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updateTraining = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId, trainingName, startDate, endDate, status } = req.body;
    const certificate = req.file?.filename || null;

    // VALIDATIONS
    if (!employeeId) return res.json({ error: "EmployeeId is required" });
    if (!trainingName) return res.json({ error: "Training Name is required" });
    if (!startDate) return res.json({ error: "Start Date is required" });
    if (!endDate) return res.json({ error: "End Date is required" });
    if (!status) return res.json({ error: "Status is required" });

    const training = await Training.findById(id);
    if (!training) return res.status(404).json({ error: "Training not found" });

    training.employeeId = employeeId;
    training.trainingName = trainingName;
    training.startDate = startDate;
    training.endDate = endDate;
    training.status = status;
    if (certificate) training.certificate = certificate;

    const updatedTraining = await training.save();

    return res.json({
      status: 200,
      message: "Training updated successfully",
      data: updatedTraining,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deleteTraining = async (req, res) => {
  try {
    const { id } = req.params;
    const training = await Training.findById(id);
    if (!training) return res.status(404).json({ error: "Training not found" });

    training.archive = true;
    const updated = await training.save();

    return res.json({
      status: 200,
      message: "Training archived successfully (soft deleted)",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createTraining,
  getTrainingList,
  getArchivedTrainings,
  getTrainingById,
  updateTraining,
  deleteTraining,
};
