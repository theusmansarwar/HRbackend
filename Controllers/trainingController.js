import Training from "../Models/trainingModel.js";

export const createTraining = async (req, res) => {
  try {
    const { employeeId, trainingName, startDate, endDate, status } = req.body;
    const certificate = req.file?.filename || null;

    // VALIDATIONS
    if (!employeeId)
      return res.status(400).json({ error: "EmployeeId is required" });
    if (!trainingName)
      return res.status(400).json({ error: "Training Name is required" });
    if (!startDate)
      return res.status(400).json({ error: "Start Date is required" });
    if (!endDate)
      return res.status(400).json({ error: "End Date is required" });
    if (!status) return res.status(400).json({ error: "Status is required" });

    const lastTraining = await Training.findOne().sort({ createdAt: -1 });
    let newIdNumber = 1;
    if (lastTraining && lastTraining.trainingId) {
      const lastNumber = parseInt(lastTraining.trainingId.split("-")[1]);
      newIdNumber = lastNumber + 1;
    }
    const trainingId = `TRN-${newIdNumber.toString().padStart(4, "0")}`;

    const newTraining = await Training.create({
      trainingId,
      employeeId,
      trainingName,
      startDate,
      endDate,
      certificate,
      status,
    });

    return res.status(201).json({
      status: 201,
      message: "Training created successfully",
      data: newTraining,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Something went wrong while creating training",
      details: error.message,
    });
  }
};

export const getTrainingList = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const trainings = await Training.find({ isArchived: false })
      .populate("employeeId", "firstName lastName employeeId")
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Training.countDocuments({ isArchived: false });

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

export const getArchivedTrainings = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const trainings = await Training.find({ isArchived: true })
      .populate("employeeId", "firstName lastName employeeId")
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Training.countDocuments({ isArchived: true });

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

export const getTrainingById = async (req, res) => {
  try {
    const { id } = req.params;

    const training = await Training.findById(id).populate(
      "employeeId",
      "firstName lastName employeeId"
    );

    if (!training)
      return res.status(404).json({ error: "Training not found" });

    return res.status(200).json({
      message: "Training fetched successfully",
      data: training,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateTraining = async (req, res) => {
  try {
    const { id } = req.params;

    // Handle both text fields and optional file
    const {
      employeeId,
      trainingName,
      startDate,
      endDate,
      status,
      archive,
    } = req.body;

    if (!employeeId)
      return res.status(400).json({ error: "EmployeeId is required" });
    if (!trainingName)
      return res.status(400).json({ error: "Training Name is required" });
    if (!startDate)
      return res.status(400).json({ error: "Start Date is required" });
    if (!endDate)
      return res.status(400).json({ error: "End Date is required" });
    if (!status)
      return res.status(400).json({ error: "Status is required" });

    // Handle certificate (file or existing)
    const certificate = req.file
      ? req.file.filename
      : req.body.certificate || null;

    const updatedTraining = await Training.findByIdAndUpdate(
      id,
      {
        employeeId,
        trainingName,
        startDate,
        endDate,
        status,
        archive,
        certificate,
      },
      { new: true }
    ).populate("employeeId", "firstName lastName employeeId");

    if (!updatedTraining)
      return res.status(404).json({ error: "Training not found" });

    return res.status(200).json({
      message: "Training updated successfully",
      data: updatedTraining,
    });
  } catch (error) {
    console.log("Update Error:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const deleteTraining = async (req, res) => {
  try {
    const { id } = req.params;

    const training = await Training.findById(id);
    if (!training)
      return res.status(404).json({ message: "Training not found" });

    training.isArchived = true; // mark as archived instead of delete
    await training.save();

    return res
      .status(200)
      .json({ message: "Training archived successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
