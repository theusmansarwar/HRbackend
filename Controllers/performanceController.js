const Performance = require("../Models/performanceModel");
const Employee = require("../Models/employeeModel");

// CREATE PERFORMANCE / APPRAISAL
const createPerformance = async (req, res) => {
  const { employeeId, KPIs, appraisalDate, score, remarks, status } = req.body;

  if (!employeeId) return res.json({ error: "Employee ID is required" });
  if (!KPIs) return res.json({ error: "At least one KPI is required" });
  if (!appraisalDate) return res.json({ error: "Appraisal Date is required" });
  if (score === undefined || score === null) return res.json({ error: "Score is required" });

  try {
    const employeeExists = await Employee.findById(employeeId);
    if (!employeeExists) {
      return res.json({ error: "Employee not found" });
    }

    const performanceCreated = await Performance.create({
      employeeId,
      KPIs,
      appraisalDate,
      score,
      remarks,
      status: status || "Not Archived",
    });

   return res.status(200).json({
  message: "Performance record created",
  data: performanceCreated,
});

  } catch (error) {
    console.error("Error creating performance:", error);
    return res.status(500).json({ error: "Server Error", details: error.message });
  }
};

// READ PERFORMANCE LIST WITH PAGINATION
const getPerformanceList = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const list = await Performance.find({ status: { $ne: "Archived" } })
      .populate("employeeId", "firstName lastName email")
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const totalRecords = await Performance.countDocuments({ status: { $ne: "Archived" } });
    const totalPages = Math.ceil(totalRecords / limit);

    return res.status(200).json({
      message: "Performance List Fetched",
      currentPage: parseInt(page),
      totalPages,
      totalRecords,
      data: list,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server Error" });
  }
};

// GET SINGLE PERFORMANCE
const getPerformanceById = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await Performance.findById(id)
      .populate("employeeId", "firstName lastName email")
      .populate("reviewerId", "firstName lastName email");

    if (!record) return res.status(404).json({ error: "Performance record not found" });

    return res.json({ message: "Performance record fetched", data: record });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// UPDATE PERFORMANCE
const updatePerformance = async (req, res) => {
  try {
    const { id } = req.params;
    const { KPIs, appraisalDate, score, remarks, reviewerId, status } = req.body;

    const performance = await Performance.findById(id);
    if (!performance) return res.status(404).json({ error: "Performance record not found" });

    if (!KPIs || (Array.isArray(KPIs) && KPIs.length === 0))
  return res.json({ error: "At least one KPI is required" });

    if (!appraisalDate) return res.json({ error: "Appraisal Date is required" });
    if (score === undefined || score === null) return res.json({ error: "Score is required" });

    performance.KPIs = KPIs;
    performance.appraisalDate = appraisalDate;
    performance.score = score;
    performance.remarks = remarks || performance.remarks;
    performance.reviewerId = reviewerId || performance.reviewerId;
    performance.status = status || performance.status;

    const updatedPerformance = await performance.save();

    return res.json({
      status: 200,
      message: "Performance record updated successfully",
      data: updatedPerformance,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// SOFT DELETE PERFORMANCE
const deletePerformance = async (req, res) => {
  try {
    const { id } = req.params;

    const performance = await Performance.findById(id);
    if (!performance) return res.status(404).json({ error: "Performance record not found" });

    performance.status = "Archived"; 
    await performance.save();

    return res.json({ status: 200, message: "Performance record archived successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// GET ARCHIVED PERFORMANCE RECORDS
const getArchivedPerformance = async (req, res) => {
  try {
    const archivedList = await Performance.find({ status: "Archived" })
      .populate("employeeId", "firstName lastName email")
      .populate("reviewerId", "firstName lastName email");

    return res.status(200).json({
      message: "Archived Performance Records",
      data: archivedList,
    });
  } catch (error) {
    return res.status(500).json({ error: "Server Error", details: error.message });
  }
};

module.exports = {
  createPerformance,
  getPerformanceList,
  getPerformanceById,
  updatePerformance,
  deletePerformance,
  getArchivedPerformance,
};
