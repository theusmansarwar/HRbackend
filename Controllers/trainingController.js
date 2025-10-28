import Training from "../Models/trainingModel.js";


// CREATE TRAINING
export const createTraining = async (req, res) => {
  try {
    const { employeeId, trainingName, startDate, endDate, status } = req.body;
    const certificate = req.file?.filename || null;

    const missingFields = [];

    if (!employeeId?.trim())
      missingFields.push({
        name: "employeeId",
        message: "Employee is required",
      });

    if (!trainingName?.trim())
      missingFields.push({
        name: "trainingName",
        message: "Training Name is required",
      });

    if (!startDate?.trim())
      missingFields.push({
        name: "startDate",
        message: "Start Date is required",
      });

    if (!endDate?.trim())
      missingFields.push({
        name: "endDate",
        message: "End Date is required",
      });

    if (!status?.trim())
      missingFields.push({
        name: "status",
        message: "Status is required",
      });

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Validation failed. Please fill all required fields.",
        missingFields,
      });
    }

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
      message: "Training created successfully ✅",
      data: newTraining,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Server error while creating training",
      details: error.message,
    });
  }
};

// UPDATE TRAINING
export const updateTraining = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId, trainingName, startDate, endDate, status, archive } = req.body;

    const missingFields = [];

    if (!employeeId?.trim())
      missingFields.push({
        name: "employeeId",
        message: "Employee is required",
      });

    if (!trainingName?.trim())
      missingFields.push({
        name: "trainingName",
        message: "Training Name is required",
      });

    if (!startDate?.trim())
      missingFields.push({
        name: "startDate",
        message: "Start Date is required",
      });

    if (!endDate?.trim())
      missingFields.push({
        name: "endDate",
        message: "End Date is required",
      });

    if (!status?.trim())
      missingFields.push({
        name: "status",
        message: "Status is required",
      });

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Validation failed. Please fill all required fields.",
        missingFields,
      });
    }

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

    if (!updatedTraining) {
      return res.status(404).json({
        status: 404,
        message: "Training not found",
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Training updated successfully ✅",
      data: updatedTraining,
    });
  } catch (error) {
    console.log("Update Error:", error);
    return res.status(500).json({
      status: 500,
      message: "Server error while updating training",
      details: error.message,
    });
  }
};



 export const getTrainingList = async (req, res) => {
  try {
    // Extract query parameters safely
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const search = req.query.search?.trim() || "";

    // Base filter for active trainings
    const baseFilter = { isArchived: false };

    // Fetch trainings with populated employee info
    let trainings = await Training.find(baseFilter)
      .populate("employeeId", "firstName lastName email employeeId")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Apply manual search after populate (same style as payroll)
    if (search) {
      const regex = new RegExp(search, "i");
      trainings = trainings.filter(
        (training) =>
          regex.test(training.trainingTitle || "") ||
          regex.test(training.trainingType || "") ||
          regex.test(training.trainingStatus || "") ||
          regex.test(training.employeeId?.firstName || "") ||
          regex.test(training.employeeId?.lastName || "") ||
          regex.test(training.employeeId?.email || "") ||
          regex.test(String(training.employeeId?.employeeId || ""))
      );
    }

    // Get total count for pagination
    const total = await Training.countDocuments(baseFilter);

    // Send clean response
    return res.status(200).json({
      message: "Active trainings fetched successfully ✅",
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
      data: trainings,
    });
  } catch (error) {
    console.error("Error fetching trainings:", error);
    return res.status(500).json({ error: "Server Error" });
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
