import Training from "../Models/trainingModel.js";
import { logActivity } from "../utils/activityLogger.js";

// ✅ Create Training
export const createTraining = async (req, res) => {
  try {
    const { employeeId, trainingName, startDate, endDate, status } = req.body;
    const certificate = req.file?.filename || null;

    const missingFields = [];
    if (!employeeId)
      missingFields.push({ name: "employeeId", message: "Employee is required" });
    if (!trainingName)
      missingFields.push({ name: "trainingName", message: "Training Name is required" });
    if (!startDate)
      missingFields.push({ name: "startDate", message: "Start Date is required" });
    if (!endDate)
      missingFields.push({ name: "endDate", message: "End Date is required" });
    if (!status)
      missingFields.push({ name: "status", message: "Status is required" });

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Missing required fields",
        missingFields,
      });
    }

    const lastTraining = await Training.findOne().sort({ createdAt: -1 });
    let newIdNumber = 1;
    if (lastTraining?.trainingId) {
      const lastNumber = parseInt(lastTraining.trainingId.split("-")[1]);
      if (!isNaN(lastNumber)) newIdNumber = lastNumber + 1;
    }
    const trainingId = `TRN-${newIdNumber.toString().padStart(4, "0")}`;

    const training = new Training({
      trainingId,
      employeeId,
      trainingName,
      startDate,
      endDate,
      status,
      certificate,
    });

    await training.save();

    await logActivity(req.user._id, "Trainings", "CREATE", null, training.toObject(), req);

    return res.status(201).json({
      status: 201,
      message: "Training created successfully",
      data: training,
    });
  } catch (error) {
    console.error("Error creating training:", error);
    return res.status(500).json({
      status: 500,
      message: "Server error while creating training",
      details: error.message,
    });
  }
};

// ✅ Update Training
export const updateTraining = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId, trainingName, startDate, endDate, status } = req.body;
    const certificate = req.file?.filename || req.body.certificate || null;

    const missingFields = [];
    if (!employeeId)
      missingFields.push({ name: "employeeId", message: "Employee is required" });
    if (!trainingName)
      missingFields.push({ name: "trainingName", message: "Training Name is required" });
    if (!startDate)
      missingFields.push({ name: "startDate", message: "Start Date is required" });
    if (!endDate)
      missingFields.push({ name: "endDate", message: "End Date is required" });
    if (!status)
      missingFields.push({ name: "status", message: "Status is required" });

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Missing required fields",
        missingFields,
      });
    }

    const training = await Training.findById(id);
    if (!training) {
      return res.status(404).json({
        status: 404,
        message: "Training not found",
      });
    }

    req.oldData = training.toObject();

    training.employeeId = employeeId;
    training.trainingName = trainingName;
    training.startDate = new Date(startDate);
    training.endDate = new Date(endDate);
    training.status = status;
    training.certificate = certificate;

    const updatedTraining = await training.save();

    await logActivity(
      req.user._id,
      "Trainings",
      "UPDATE",
      req.oldData,
      updatedTraining.toObject(),
      req
    );

    return res.status(200).json({
      status: 200,
      message: "Training updated successfully",
      data: updatedTraining,
    });
  } catch (error) {
    console.error("Error updating training:", error);
    return res.status(500).json({
      status: 500,
      message: "Server error while updating training",
      details: error.message,
    });
  }
};

// ✅ Get All Active Trainings (with pagination & search)
export const getTrainingList = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const search = req.query.search?.trim() || "";

    const baseFilter = { isArchived: false };

    let trainings = await Training.find(baseFilter)
      .populate("employeeId", "firstName lastName email employeeId")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    if (search) {
      const regex = new RegExp(search, "i");
      trainings = trainings.filter(
        (training) =>
          regex.test(training.trainingName || "") ||
          regex.test(training.status || "") ||
          regex.test(training.certificate || "") ||
          regex.test(training.employeeId?.firstName || "") ||
          regex.test(training.employeeId?.lastName || "") ||
          regex.test(training.employeeId?.email || "") ||
          regex.test(training.employeeId?.employeeId || "")
      );
    }

    const total = await Training.countDocuments(baseFilter);

    return res.status(200).json({
      message: "Active trainings fetched successfully",
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
      data: trainings,
    });
  } catch (error) {
    console.error("Error fetching trainings:", error);
    return res.status(500).json({
      status: 500,
      message: "Server error while fetching trainings",
    });
  }
};

// ✅ Get Archived Trainings
export const getArchivedTrainings = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const trainings = await Training.find({ isArchived: true })
      .populate("employeeId", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Training.countDocuments({ isArchived: true });

    return res.status(200).json({
      message: "Archived trainings fetched successfully",
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      data: trainings,
    });
  } catch (error) {
    console.error("Error fetching archived trainings:", error);
    return res.status(500).json({
      status: 500,
      message: "Server error while fetching archived trainings",
    });
  }
};

// ✅ Get Training by ID
export const getTrainingById = async (req, res) => {
  try {
    const { id } = req.params;
    const training = await Training.findById(id).populate(
      "employeeId",
      "firstName lastName email employeeId"
    );

    if (!training)
      return res.status(404).json({ error: "Training not found" });

    return res.status(200).json({
      message: "Training fetched successfully",
      data: training,
    });
  } catch (error) {
    console.error("Error fetching training by ID:", error);
    return res.status(500).json({ error: error.message });
  }
};

// ✅ Delete (Archive) Training
export const deleteTraining = async (req, res) => {
  try {
    const { id } = req.params;
    const training = await Training.findById(id);

    if (!training)
      return res.status(404).json({ message: "Training not found" });

    req.oldData = training.toObject();

    training.isArchived = true;
    await training.save();

    await logActivity(req.user._id, "Trainings", "DELETE", req.oldData, null, req);

    return res.status(200).json({
      status: 200,
      message: "Training archived successfully",
    });
  } catch (error) {
    console.error("Error archiving training:", error);
    return res.status(500).json({
      status: 500,
      message: "Server error while archiving training",
    });
  }
};
