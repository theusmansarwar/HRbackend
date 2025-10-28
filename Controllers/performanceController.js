import Performance from "../Models/performanceModel.js";
import Employee from "../Models/employeeModel.js";

export const createPerformance = async (req, res) => {
  try {
    const {
      employeeId,
      reviewerId,
      KPIs,
      appraisalDate,
      score,
      remarks,
      status,
    } = req.body;

    const missingFields = [];

    if (!employeeId)
      missingFields.push({ name: "employeeId", message: "Employee is required" });
     
    if (!KPIs  || KPIs.length === 0)
      missingFields.push({ name: "KPIs", message: "At least one KPI is required" });
    if (!appraisalDate)
      missingFields.push({ name: "appraisalDate", message: "Appraisal Date is required" });
    if (score === undefined || score === null || score === "")
      missingFields.push({ name: "score", message: "Score is required" });
    if (!remarks)
      missingFields.push({ name: "remarks", message: "Remarks are required" });
    if (!status)
      missingFields.push({ name: "status", message: "Status is required" });

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Validation failed. Some fields are missing.",
        missingFields,
      });
    }

    const employeeExists = await Employee.findById(employeeId);
    if (!employeeExists)
      return res.status(404).json({ message: "Employee not found" });

    // 🔹 Generate unique performanceId
    const lastPerformance = await Performance.findOne().sort({ createdAt: -1 });
    let newIdNumber = 1;
    if (lastPerformance?.performanceId) {
      const lastNumber = parseInt(lastPerformance.performanceId.split("-")[1]);
      newIdNumber = lastNumber + 1;
    }
    const performanceId = `PERF-${newIdNumber.toString().padStart(4, "0")}`;

    // ✅ Create Performance Record
    const performance = await Performance.create({
      performanceId,
      employeeId,
      reviewerId,
      KPIs,
      appraisalDate,
      score,
      remarks,
      status,
    });

    return res.status(201).json({
      status: 201,
      message: "Performance created successfully ✅",
      data: performance,
    });
  } catch (error) {
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

export const updatePerformance = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      employeeId,
      reviewerId,
      KPIs,
      appraisalDate,
      score,
      remarks,
      status,
    } = req.body;

    const missingFields = [];

    if (!employeeId)
      missingFields.push({ name: "employeeId", message: "Employee is required" });

    if (!KPIs || KPIs.length === 0)
      missingFields.push({ name: "KPIs", message: "At least one KPI is required" });

    if (!appraisalDate)
      missingFields.push({ name: "appraisalDate", message: "Appraisal Date is required" });

    if (score === undefined || score === null || score === "")
      missingFields.push({ name: "score", message: "Score is required" });

    if (!remarks)
      missingFields.push({ name: "remarks", message: "Remarks are required" });

    if (!status)
      missingFields.push({ name: "status", message: "Status is required" });

    // ✅ If validation fails, return errors
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Validation failed. Some fields are missing.",
        missingFields,
      });
    }

    // ✅ Check if performance record exists
    const performanceRecord = await Performance.findById(id);
    if (!performanceRecord) {
      return res.status(404).json({ message: "Performance record not found" });
    }

    // ✅ Check if employee exists
    const employeeExists = await Employee.findById(employeeId);
    if (!employeeExists) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // ✅ Update performance record
    const updatedPerformance = await Performance.findByIdAndUpdate(
      id,
      {
        employeeId,
        reviewerId,
        KPIs,
        appraisalDate,
        score,
        remarks,
        status,
      },
      { new: true }
    )
      .populate("employeeId", "firstName lastName email")
      .populate("reviewerId", "firstName lastName email");

    return res.status(200).json({
      status: 200,
      message: "Performance updated successfully ✅",
      data: updatedPerformance,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Server error while updating performance",
      details: error.message,
    });
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
