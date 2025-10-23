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
    // Safe query parameter handling
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const search = req.query.search?.trim() || "";

    // Base filter (excluding archived)
    const baseFilter = { status: { $ne: "Archived" } };

    // Fetch performance records with employee & reviewer info
    let performanceList = await Performance.find(baseFilter)
      .populate("employeeId", "firstName lastName email employeeId")
      .populate("reviewerId", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Apply manual search after populate (for related fields)
    if (search) {
      const regex = new RegExp(search, "i");
      performanceList = performanceList.filter(
        (item) =>
          regex.test(item.reviewPeriod || "") ||
          regex.test(item.performanceRating || "") ||
          regex.test(item.comments || "") ||
          regex.test(item.employeeId?.firstName || "") ||
          regex.test(item.employeeId?.lastName || "") ||
          regex.test(item.employeeId?.email || "") ||
          regex.test(item.reviewerId?.firstName || "") ||
          regex.test(item.reviewerId?.lastName || "") ||
          regex.test(item.reviewerId?.email || "")
      );
    }

    // Get total count for pagination
    const total = await Performance.countDocuments(baseFilter);

    // Send clean response
    return res.status(200).json({
      message: "Active performance records fetched successfully ✅",
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
      data: performanceList,
    });
  } catch (error) {
    console.error("Error fetching performance list:", error);
    return res.status(500).json({ error: "Server Error" });
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
