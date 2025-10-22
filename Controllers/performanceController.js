import Performance from "../Models/performanceModel.js";
import Employee from "../Models/employeeModel.js";

// CREATE PERFORMANCE
export const createPerformance = async (req, res) => {
  try {
    const { employeeId, KPIs, appraisalDate, score, remarks, reviewerId, status } = req.body;

    // VALIDATIONS
    if (!employeeId) return res.status(400).json({ error: "Employee ID is required" });
    if (!KPIs || !Array.isArray(KPIs) || KPIs.length === 0)
      return res.status(400).json({ error: "At least one KPI is required" });
    if (!appraisalDate) return res.status(400).json({ error: "Appraisal Date is required" });
    if (score === undefined || score === null) return res.status(400).json({ error: "Score is required" });

    const employeeExists = await Employee.findById(employeeId);
    if (!employeeExists) return res.status(404).json({ error: "Employee not found" });

    // Generate unique performanceId like PERF-0001
    const lastPerformance = await Performance.findOne().sort({ createdAt: -1 });
    let newIdNumber = 1;
    if (lastPerformance && lastPerformance.performanceId) {
      const lastNumber = parseInt(lastPerformance.performanceId.split("-")[1]);
      newIdNumber = lastNumber + 1;
    }
    const performanceId = `PERF-${newIdNumber.toString().padStart(4, "0")}`;

    // Create performance record
    const performance = await Performance.create({
      performanceId,
      employeeId,
      KPIs,
      appraisalDate,
      score,
      remarks,
      reviewerId,
      status: status || "Not Archived",
    });

    return res.status(201).json({
      status: 201,
      message: "Performance record created successfully",
      data: performance,
    });
  } catch (error) {
    console.error("Error creating performance:", error);
    return res.status(500).json({
      status: 500,
      message: "Server error while creating performance",
      details: error.message,
    });
  }
};
// GET PERFORMANCE LIST (with pagination)
export const getPerformanceList = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const list = await Performance.find({ status: { $ne: "Archived" } })
      .populate("employeeId", "firstName lastName email")
      .populate("reviewerId", "firstName lastName email")
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Performance.countDocuments({ status: { $ne: "Archived" } });

    return res.status(200).json({
      status: 200,
      message: "Performance list fetched successfully",
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      data: list,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 500, message: "Server Error", details: error.message });
  }
};

// GET SINGLE PERFORMANCE BY ID
export const getPerformanceById = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await Performance.findById(id)
      .populate("employeeId", "firstName lastName email")
      .populate("reviewerId", "firstName lastName email");

    if (!record) return res.status(404).json({ status: 404, error: "Performance record not found" });

    return res.status(200).json({
      status: 200,
      message: "Performance record fetched successfully",
      data: record,
    });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};

// UPDATE PERFORMANCE
export const updatePerformance = async (req, res) => {
  try {
    const { id } = req.params;
    const { KPIs, appraisalDate, score, remarks, reviewerId, status } = req.body;

    const performance = await Performance.findById(id);
    if (!performance) return res.status(404).json({ status: 404, error: "Performance record not found" });

    if (!KPIs || (Array.isArray(KPIs) && KPIs.length === 0))
      return res.status(400).json({ error: "At least one KPI is required" });
    if (!appraisalDate) return res.status(400).json({ error: "Appraisal Date is required" });
    if (score === undefined || score === null) return res.status(400).json({ error: "Score is required" });

    performance.KPIs = KPIs;
    performance.appraisalDate = appraisalDate;
    performance.score = score;
    performance.remarks = remarks || performance.remarks;
    performance.reviewerId = reviewerId || performance.reviewerId;
    performance.status = status || performance.status;

    const updatedPerformance = await performance.save();

    return res.status(200).json({
      status: 200,
      message: "Performance record updated successfully",
      data: updatedPerformance,
    });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};

// SOFT DELETE PERFORMANCE
export const deletePerformance = async (req, res) => {
  try {
    const { id } = req.params;
    const performance = await Performance.findById(id);
    if (!performance) return res.status(404).json({ status: 404, error: "Performance record not found" });

    performance.status = "Archived";
    await performance.save();

    return res.status(200).json({
      status: 200,
      message: "Performance record archived successfully",
    });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};

// GET ARCHIVED PERFORMANCE RECORDS
export const getArchivedPerformance = async (req, res) => {
  try {
    const archivedList = await Performance.find({ status: "Archived" })
      .populate("employeeId", "firstName lastName email")
      .populate("reviewerId", "firstName lastName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: 200,
      message: "Archived performance records fetched successfully",
      data: archivedList,
    });
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Server Error", details: error.message });
  }
};
