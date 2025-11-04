// controllers/performanceController.js
import Performance from "../Models/performanceModel.js";
import Employee from "../Models/employeeModel.js";
import { logActivity } from "../utils/activityLogger.js";


const ValidationRules = {
  // KPIs validation: Array of strings
  kpis: {
    pattern: /^[a-zA-Z][a-zA-Z0-9\s,.\-&()%]+$/,
    minLength: 1,
    maxLength: 10,
    itemMinLength: 5,
    itemMaxLength: 200,
    message: "Must start with letter. Use letters, numbers, spaces, , . - & ( ) %",
  },
  
  // Score validation: 0-100
  score: {
    min: 0,
    max: 100,
    message: "Score must be between 0 and 100",
  },
  
  // Remarks validation
  remarks: {
    pattern: /^[a-zA-Z0-9\s,.\-!?'"()]+$/,
    minLength: 10,
    maxLength: 500,
    message: "Use letters, numbers, spaces, and basic punctuation",
  },
  
  // Status validation
  status: {
    allowedValues: ['Pending', 'In Progress', 'Completed', 'Archived'],
    message: "Select valid status",
  },
};

// Validate Employee ID
const validateEmployeeId = (employeeId, fieldName = "Employee") => {
  if (!employeeId || typeof employeeId !== 'string' || !employeeId.trim()) {
    return { valid: false, message: `${fieldName} is required` };
  }
  
  return { valid: true };
};

// Validate KPIs Array
const validateKPIs = (kpis) => {
  if (!kpis) {
    return { valid: false, message: "KPIs are required" };
  }
  
  if (!Array.isArray(kpis)) {
    return { valid: false, message: "KPIs must be an array" };
  }
  
  if (kpis.length < ValidationRules.kpis.minLength) {
    return { valid: false, message: "At least one KPI is required" };
  }
  
  if (kpis.length > ValidationRules.kpis.maxLength) {
    return { valid: false, message: `Maximum ${ValidationRules.kpis.maxLength} KPIs allowed` };
  }
  
  // Check each KPI
  for (let i = 0; i < kpis.length; i++) {
    const kpi = kpis[i];
    
    if (!kpi || typeof kpi !== 'string' || !kpi.trim()) {
      return { valid: false, message: `KPI #${i + 1} cannot be empty` };
    }
    
    const trimmedKpi = kpi.trim();
    
    if (trimmedKpi.length < ValidationRules.kpis.itemMinLength) {
      return { 
        valid: false, 
        message: `KPI #${i + 1} must be at least ${ValidationRules.kpis.itemMinLength} characters` 
      };
    }
    
    if (trimmedKpi.length > ValidationRules.kpis.itemMaxLength) {
      return { 
        valid: false, 
        message: `KPI #${i + 1} must not exceed ${ValidationRules.kpis.itemMaxLength} characters` 
      };
    }
    
    // Check pattern - must start with letter and contain valid characters
    if (!ValidationRules.kpis.pattern.test(trimmedKpi)) {
      return { 
        valid: false, 
        message: `KPI #${i + 1}: ${ValidationRules.kpis.message}` 
      };
    }
    
    // Additional check: Must contain at least one letter
    if (!/[a-zA-Z]/.test(trimmedKpi)) {
      return { 
        valid: false, 
        message: `KPI #${i + 1} must contain at least one letter` 
      };
    }
  }
  
  return { valid: true };
};

// Validate Appraisal Date
const validateAppraisalDate = (appraisalDate) => {
  if (!appraisalDate || typeof appraisalDate !== 'string' || !appraisalDate.trim()) {
    return { valid: false, message: "Appraisal Date is required" };
  }
  
  const date = new Date(appraisalDate);
  if (isNaN(date.getTime())) {
    return { valid: false, message: "Invalid date format" };
  }
  
  // Check if date is not more than 5 years in the past
  const fiveYearsAgo = new Date();
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
  
  if (date < fiveYearsAgo) {
    return { valid: false, message: "Date cannot be more than 5 years old" };
  }
  
  // Check if date is not more than 1 year in future
  const oneYearLater = new Date();
  oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
  
  if (date > oneYearLater) {
    return { valid: false, message: "Date cannot be more than 1 year in future" };
  }
  
  return { valid: true };
};

// Validate Score
const validateScore = (score) => {
  if (score === undefined || score === null || score === '') {
    return { valid: false, message: "Score is required" };
  }
  
  const scoreNum = parseFloat(score);
  
  if (isNaN(scoreNum)) {
    return { valid: false, message: "Score must be a valid number" };
  }
  
  if (scoreNum < ValidationRules.score.min || scoreNum > ValidationRules.score.max) {
    return { valid: false, message: ValidationRules.score.message };
  }
  
  return { valid: true };
};

// Validate Remarks
const validateRemarks = (remarks) => {
  if (!remarks || typeof remarks !== 'string' || !remarks.trim()) {
    return { valid: false, message: "Remarks are required" };
  }
  
  const trimmedRemarks = remarks.trim();
  
  if (trimmedRemarks.length < ValidationRules.remarks.minLength) {
    return { 
      valid: false, 
      message: `Minimum ${ValidationRules.remarks.minLength} characters required` 
    };
  }
  
  if (trimmedRemarks.length > ValidationRules.remarks.maxLength) {
    return { 
      valid: false, 
      message: `Maximum ${ValidationRules.remarks.maxLength} characters allowed` 
    };
  }
  
  if (!ValidationRules.remarks.pattern.test(trimmedRemarks)) {
    return { valid: false, message: ValidationRules.remarks.message };
  }
  
  return { valid: true };
};

// Validate Status
const validateStatus = (status) => {
  if (!status || typeof status !== 'string' || !status.trim()) {
    return { valid: false, message: "Status is required" };
  }
  
  const trimmedStatus = status.trim();
  
  if (!ValidationRules.status.allowedValues.includes(trimmedStatus)) {
    return { valid: false, message: ValidationRules.status.message };
  }
  
  return { valid: true };
};

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

    // Validate Employee ID
    const empValidation = validateEmployeeId(employeeId, "Employee");
    if (!empValidation.valid) {
      missingFields.push({ name: "employeeId", message: empValidation.message });
    }

    // Validate Reviewer ID (optional field, but if provided must be valid)
    if (reviewerId) {
      const reviewerValidation = validateEmployeeId(reviewerId, "Reviewer");
      if (!reviewerValidation.valid) {
        missingFields.push({ name: "reviewerId", message: reviewerValidation.message });
      }
    }

    // Validate KPIs
    const kpiValidation = validateKPIs(KPIs);
    if (!kpiValidation.valid) {
      missingFields.push({ name: "KPIs", message: kpiValidation.message });
    }

    // Validate Appraisal Date
    const dateValidation = validateAppraisalDate(appraisalDate);
    if (!dateValidation.valid) {
      missingFields.push({ name: "appraisalDate", message: dateValidation.message });
    }

    // Validate Score
    const scoreValidation = validateScore(score);
    if (!scoreValidation.valid) {
      missingFields.push({ name: "score", message: scoreValidation.message });
    }

    // Validate Remarks
    const remarksValidation = validateRemarks(remarks);
    if (!remarksValidation.valid) {
      missingFields.push({ name: "remarks", message: remarksValidation.message });
    }

    // Validate Status
    const statusValidation = validateStatus(status);
    if (!statusValidation.valid) {
      missingFields.push({ name: "status", message: statusValidation.message });
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Validation failed. Please correct the errors.",
        missingFields,
      });
    }

    const employeeExists = await Employee.findById(employeeId.trim());
    if (!employeeExists) {
      return res.status(404).json({
        status: 404,
        message: "Employee not found",
        missingFields: [{ name: "employeeId", message: "Selected employee does not exist" }],
      });
    }

    if (reviewerId && reviewerId.trim()) {
      const reviewerExists = await Employee.findById(reviewerId.trim());
      if (!reviewerExists) {
        return res.status(404).json({
          status: 404,
          message: "Reviewer not found",
          missingFields: [{ name: "reviewerId", message: "Selected reviewer does not exist" }],
        });
      }
    }

    const lastPerformance = await Performance.findOne().sort({ createdAt: -1 });
    let newIdNumber = 1;
    if (lastPerformance?.performanceId) {
      const lastNumber = parseInt(lastPerformance.performanceId.split("-")[1]);
      if (!isNaN(lastNumber)) newIdNumber = lastNumber + 1;
    }
    const performanceId = `PERF-${newIdNumber.toString().padStart(4, "0")}`;

    const performance = await Performance.create({
      performanceId,
      employeeId: employeeId.trim(),
      reviewerId: reviewerId ? reviewerId.trim() : null,
      KPIs: KPIs.map(kpi => kpi.trim()),
      appraisalDate,
      score: parseFloat(score),
      remarks: remarks.trim(),
      status: status.trim(),
    });

     await logActivity(req.user._id, "Performance", "CREATE", null, performance.toObject(), req);



    return res.status(201).json({
      status: 201,
      message: "Performance created successfully",
      data: performance,
    });
  } catch (error) {
    console.error("Create Performance Error:", error);
    return res.status(500).json({
      status: 500,
      message: "Server error while creating performance",
      details: error.message,
    });
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

    // Check if performance record exists
    const performanceRecord = await Performance.findById(id);
    if (!performanceRecord) {
      return res.status(404).json({
        status: 404,
        message: "Performance record not found",
      });
    }

    const missingFields = [];

    const empValidation = validateEmployeeId(employeeId, "Employee");
    if (!empValidation.valid) {
      missingFields.push({ name: "employeeId", message: empValidation.message });
    }

    if (reviewerId) {
      const reviewerValidation = validateEmployeeId(reviewerId, "Reviewer");
      if (!reviewerValidation.valid) {
        missingFields.push({ name: "reviewerId", message: reviewerValidation.message });
      }
    }

    const kpiValidation = validateKPIs(KPIs);
    if (!kpiValidation.valid) {
      missingFields.push({ name: "KPIs", message: kpiValidation.message });
    }

    const dateValidation = validateAppraisalDate(appraisalDate);
    if (!dateValidation.valid) {
      missingFields.push({ name: "appraisalDate", message: dateValidation.message });
    }

    const scoreValidation = validateScore(score);
    if (!scoreValidation.valid) {
      missingFields.push({ name: "score", message: scoreValidation.message });
    }

    const remarksValidation = validateRemarks(remarks);
    if (!remarksValidation.valid) {
      missingFields.push({ name: "remarks", message: remarksValidation.message });
    }

    const statusValidation = validateStatus(status);
    if (!statusValidation.valid) {
      missingFields.push({ name: "status", message: statusValidation.message });
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Validation failed. Please correct the errors.",
        missingFields,
      });
    }
    const employeeExists = await Employee.findById(employeeId.trim());
    if (!employeeExists) {
      return res.status(404).json({
        status: 404,
        message: "Employee not found",
        missingFields: [{ name: "employeeId", message: "Selected employee does not exist" }],
      });
    }

    if (reviewerId && reviewerId.trim()) {
      const reviewerExists = await Employee.findById(reviewerId.trim());
      if (!reviewerExists) {
        return res.status(404).json({
          status: 404,
          message: "Reviewer not found",
          missingFields: [{ name: "reviewerId", message: "Selected reviewer does not exist" }],
        });
      }
    }

    req.oldData = performanceRecord.toObject();

    const updatedPerformance = await Performance.findByIdAndUpdate(
      id,
      {
        employeeId: employeeId.trim(),
        reviewerId: reviewerId ? reviewerId.trim() : null,
        KPIs: KPIs.map(kpi => kpi.trim()),
        appraisalDate,
        score: parseFloat(score),
        remarks: remarks.trim(),
        status: status.trim(),
      },
      { new: true }
    )
      .populate("employeeId", "firstName lastName email")
      .populate("reviewerId", "firstName lastName email");

      await logActivity(
  req.user._id,
  "Performance",
  "UPDATE",
  req.oldData,
  updatedPerformance.toObject(),
  req
);

    return res.status(200).json({
      status: 200,
      message: "Performance updated successfully",
      data: updatedPerformance,
    });
  } catch (error) {
    console.error("Update Performance Error:", error);
    return res.status(500).json({
      status: 500,
      message: "Server error while updating performance",
      details: error.message,
    });
  }
};

export const getPerformanceList = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const search = req.query.search?.trim() || "";
    const skip = (page - 1) * limit;

    const baseFilter = { status: { $ne: "Archived" } };

    let query = Performance.find(baseFilter)
      .populate({
        path: "employeeId",
        select: "firstName lastName email employeeId",
      })
      .populate({
        path: "reviewerId",
        select: "firstName lastName email",
      });

    if (search) {
      const regex = new RegExp(search, "i");
      query = query.find({
        $or: [
          { performanceId: regex },
          { remarks: regex },
          { status: regex },
          { KPIs: regex },
          { "employeeId.firstName": regex },
          { "employeeId.lastName": regex },
          { "employeeId.email": regex },
          { "employeeId.employeeId": regex },
          { "reviewerId.firstName": regex },
          { "reviewerId.lastName": regex },
          { "reviewerId.email": regex },
          { $expr: { $regexMatch: { input: { $toString: "$score" }, regex: search, options: "i" } } },
        ],
      });
    }

    const total = await Performance.countDocuments(query.getQuery());

    const performanceList = await query
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .select(
        "performanceId KPIs appraisalDate score remarks status createdAt updatedAt employeeId reviewerId"
      );

    return res.status(200).json({
      message: "Active performance records fetched successfully",
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
      data: performanceList,
    });
  } catch (error) {
    console.error("Error fetching performance list:", error);
    return res.status(500).json({
      message: "Server error while fetching performance records",
      error: error.message,
    });
  }
};

export const getPerformanceById = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await Performance.findById(id)
      .populate("employeeId", "firstName lastName email")
      .populate("reviewerId", "firstName lastName email");

    if (!record) {
      return res.status(404).json({
        status: 404,
        error: "Performance record not found",
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Performance record fetched successfully",
      data: record,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};

export const deletePerformance = async (req, res) => {
  try {
    const { id } = req.params;
    const performance = await Performance.findById(id);

    if (!performance) {
      return res.status(404).json({
        status: 404,
        error: "Performance record not found",
      });
    }

    req.oldData = performance.toObject();

    performance.status = "Archived";
    await performance.save();

    await logActivity(
  req.user._id,
  "Performance",
  "DELETE",
  req.oldData,
  null,
  req
);

    return res.status(200).json({
      status: 200,
      message: "Performance record archived successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};

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
    return res.status(500).json({
      status: 500,
      message: "Server error while fetching archived records",
      details: error.message,
    });
  }
};

export default {
  createPerformance,
  updatePerformance,
  getPerformanceList,
  getPerformanceById,
  deletePerformance,
  getArchivedPerformance,
};