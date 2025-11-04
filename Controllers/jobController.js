import Job from "../Models/jobModel.js";
import { logActivity } from "../utils/activityLogger.js";

// ===========================
// VALIDATION RULES
// ===========================
const ValidationRules = {
  // Job Title validation: Letters, numbers, spaces, hyphens, and common punctuation
  jobTitle: {
    pattern: /^[a-zA-Z0-9\s\-\.\,\(\)\/&]+$/,
    minLength: 3,
    maxLength: 100,
    message: "Job Title must contain only letters, numbers, spaces, and basic punctuation (3-100 characters)",
  },

  // Job Description validation
  jobDescription: {
    pattern: /^(?=.*[a-zA-Z])[\s\S]*$/,  // Must contain at least one letter
    minLength: 20,
    maxLength: 2000,
    message: "Job Description must be between 20-2000 characters and contain meaningful text",
  },

  // Status validation
  status: {
    allowedValues: ["Open", "Closed", "On Hold", "Draft"],
    message: "Status must be one of: Open, Closed, On Hold, Draft",
  },
};

// ===========================
// VALIDATION FUNCTIONS
// ===========================

// Validate Job Title
const validateJobTitle = (jobTitle) => {
  if (!jobTitle || !jobTitle.trim()) {
    return { valid: false, message: "Job Title is required" };
  }

  const trimmedTitle = jobTitle.trim();

  if (trimmedTitle.length < ValidationRules.jobTitle.minLength) {
    return {
      valid: false,
      message: `Job Title must be at least ${ValidationRules.jobTitle.minLength} characters`,
    };
  }

  if (trimmedTitle.length > ValidationRules.jobTitle.maxLength) {
    return {
      valid: false,
      message: `Job Title must not exceed ${ValidationRules.jobTitle.maxLength} characters`,
    };
  }

  if (!ValidationRules.jobTitle.pattern.test(trimmedTitle)) {
    return { valid: false, message: ValidationRules.jobTitle.message };
  }

  return { valid: true };
};

// Validate Job Description
const validateJobDescription = (jobDescription) => {
  if (!jobDescription || !jobDescription.trim()) {
    return { valid: false, message: "Job Description is required" };
  }

  const trimmedDescription = jobDescription.trim();

  if (trimmedDescription.length < ValidationRules.jobDescription.minLength) {
    return {
      valid: false,
      message: `Job Description must be at least ${ValidationRules.jobDescription.minLength} characters`,
    };
  }

  if (trimmedDescription.length > ValidationRules.jobDescription.maxLength) {
    return {
      valid: false,
      message: `Job Description must not exceed ${ValidationRules.jobDescription.maxLength} characters`,
    };
  }

  // Check if description contains at least one letter (not just numbers/symbols)
  if (!ValidationRules.jobDescription.pattern.test(trimmedDescription)) {
    return {
      valid: false,
      message: "Job Description must contain meaningful text, not just numbers or symbols",
    };
  }

  return { valid: true };
};

// Validate Status
const validateStatus = (status) => {
  if (!status || !status.trim()) {
    return { valid: false, message: "Status is required" };
  }

  const trimmedStatus = status.trim();

  if (!ValidationRules.status.allowedValues.includes(trimmedStatus)) {
    return { valid: false, message: ValidationRules.status.message };
  }

  return { valid: true };
};

// Validate Date
const validateDate = (date, fieldName = "Date") => {
  if (!date || !date.toString().trim()) {
    return { valid: false, message: `${fieldName} is required` };
  }

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return { valid: false, message: `Invalid ${fieldName} format` };
  }

  return { valid: true };
};

// Validate Date Range
const validateDateRange = (postingDate, expiryDate) => {
  const posting = new Date(postingDate);
  const expiry = new Date(expiryDate);

  if (expiry <= posting) {
    return {
      valid: false,
      message: "Expiry Date must be after Posting Date",
    };
  }

  return { valid: true };
};

// Validate MongoDB ObjectId
const validateObjectId = (id, fieldName = "ID") => {
  if (!id || !id.trim()) {
    return { valid: false, message: `${fieldName} is required` };
  }

  // MongoDB ObjectId is 24 characters hexadecimal string
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  if (!objectIdPattern.test(id.trim())) {
    return { valid: false, message: `Invalid ${fieldName} format` };
  }

  return { valid: true };
};

export const createJob = async (req, res) => {
  try {
    const {
      jobTitle,
      jobDescription,
      departmentId,
      designationId,
      postedBy,
      status,
      postingDate,
      expiryDate,
    } = req.body;

    const missingFields = [];

    // Validate Job Title
    const titleValidation = validateJobTitle(jobTitle);
    if (!titleValidation.valid) {
      missingFields.push({
        name: "jobTitle",
        message: titleValidation.message,
      });
    }

    // Validate Job Description
    const descriptionValidation = validateJobDescription(jobDescription);
    if (!descriptionValidation.valid) {
      missingFields.push({
        name: "jobDescription",
        message: descriptionValidation.message,
      });
    }

    // Validate Department ID
    const departmentValidation = validateObjectId(departmentId, "Department");
    if (!departmentValidation.valid) {
      missingFields.push({
        name: "departmentId",
        message: departmentValidation.message,
      });
    }

    // Validate Designation ID
    const designationValidation = validateObjectId(designationId, "Designation");
    if (!designationValidation.valid) {
      missingFields.push({
        name: "designationId",
        message: designationValidation.message,
      });
    }

    // Validate Status
    const statusValidation = validateStatus(status);
    if (!statusValidation.valid) {
      missingFields.push({
        name: "status",
        message: statusValidation.message,
      });
    }

    // Validate Posting Date
    const postingDateValidation = validateDate(postingDate, "Posting Date");
    if (!postingDateValidation.valid) {
      missingFields.push({
        name: "postingDate",
        message: postingDateValidation.message,
      });
    }

    // Validate Expiry Date
    const expiryDateValidation = validateDate(expiryDate, "Expiry Date");
    if (!expiryDateValidation.valid) {
      missingFields.push({
        name: "expiryDate",
        message: expiryDateValidation.message,
      });
    }

    // Validate Date Range (only if both dates are valid)
    if (postingDateValidation.valid && expiryDateValidation.valid) {
      const dateRangeValidation = validateDateRange(postingDate, expiryDate);
      if (!dateRangeValidation.valid) {
        missingFields.push({
          name: "expiryDate",
          message: dateRangeValidation.message,
        });
      }
    }

    // Return all validation errors
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Validation failed. Please correct the errors.",
        missingFields,
      });
    }

    // Generate unique jobId
    const lastJob = await Job.findOne().sort({ createdAt: -1 });
    let newIdNumber = 1;
    if (lastJob?.jobId) {
      const lastNumber = parseInt(lastJob.jobId.split("-")[1]);
      newIdNumber = lastNumber + 1;
    }
    const jobId = `JOB-${newIdNumber.toString().padStart(4, "0")}`;

    // Create job with trimmed values
    const job = await Job.create({
      jobId,
      jobTitle: jobTitle.trim(),
      jobDescription: jobDescription.trim(),
      departmentId: departmentId.trim(),
      designationId: designationId.trim(),
      postedBy,
      status: status.trim(),
      postingDate,
      expiryDate,
    });

    await logActivity(req.user._id, "Job", "CREATE", null, job.toObject(), req);

    return res.status(201).json({
      status: 201,
      message: "Job created successfully",
      data: job,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Server error while creating job",
      details: error.message,
    });
  }
};

export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      jobTitle,
      jobDescription,
      departmentId,
      designationId,
      postedBy,
      status,
      postingDate,
      expiryDate,
    } = req.body;

    const missingFields = [];

    // Validate Job Title
    const titleValidation = validateJobTitle(jobTitle);
    if (!titleValidation.valid) {
      missingFields.push({
        name: "jobTitle",
        message: titleValidation.message,
      });
    }

    // Validate Job Description
    const descriptionValidation = validateJobDescription(jobDescription);
    if (!descriptionValidation.valid) {
      missingFields.push({
        name: "jobDescription",
        message: descriptionValidation.message,
      });
    }

    // Validate Department ID
    const departmentValidation = validateObjectId(departmentId, "Department");
    if (!departmentValidation.valid) {
      missingFields.push({
        name: "departmentId",
        message: departmentValidation.message,
      });
    }

    // Validate Designation ID
    const designationValidation = validateObjectId(designationId, "Designation");
    if (!designationValidation.valid) {
      missingFields.push({
        name: "designationId",
        message: designationValidation.message,
      });
    }

    // Validate Status
    const statusValidation = validateStatus(status);
    if (!statusValidation.valid) {
      missingFields.push({
        name: "status",
        message: statusValidation.message,
      });
    }

    // Validate Posting Date
    const postingDateValidation = validateDate(postingDate, "Posting Date");
    if (!postingDateValidation.valid) {
      missingFields.push({
        name: "postingDate",
        message: postingDateValidation.message,
      });
    }

    // Validate Expiry Date
    const expiryDateValidation = validateDate(expiryDate, "Expiry Date");
    if (!expiryDateValidation.valid) {
      missingFields.push({
        name: "expiryDate",
        message: expiryDateValidation.message,
      });
    }

    // Validate Date Range (only if both dates are valid)
    if (postingDateValidation.valid && expiryDateValidation.valid) {
      const dateRangeValidation = validateDateRange(postingDate, expiryDate);
      if (!dateRangeValidation.valid) {
        missingFields.push({
          name: "expiryDate",
          message: dateRangeValidation.message,
        });
      }
    }

    // Return all validation errors
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Validation failed. Please correct the errors.",
        missingFields,
      });
    }

    const oldJob = await Job.findById(id);
    if (!oldJob) {
      return res.status(404).json({
        status: 404,
        message: "Job not found",
      });
    }

    req.oldData = oldJob.toObject();

    // Update job with trimmed values
    const updatedJob = await Job.findByIdAndUpdate(
      id,
      {
        jobTitle: jobTitle.trim(),
        jobDescription: jobDescription.trim(),
        departmentId: departmentId.trim(),
        designationId: designationId.trim(),
        postedBy,
        status: status.trim(),
        postingDate,
        expiryDate,
      },
      { new: true }
    )
      .populate("departmentId")
      .populate("designationId");

    if (!updatedJob) {
      return res.status(404).json({
        status: 404,
        message: "Job not found",
      });
    }

    await logActivity(
      req.user._id,
      "Job",
      "UPDATE",
      req.oldData,
      updatedJob.toObject(),
      req
    );

    return res.status(200).json({
      status: 200,
      message: "Job updated successfully",
      data: updatedJob,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Server error while updating job",
      details: error.message,
    });
  }
};

export const getJobList = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const search = req.query.search?.trim() || "";
    const skip = (page - 1) * limit;

    const baseFilter = { isArchived: false };

    let query = Job.find(baseFilter)
      .populate({
        path: "departmentId",
        select: "departmentName departmentCode",
      })
      .populate({
        path: "designationId",
        select: "designationName",
      });

    if (search) {
      const regex = new RegExp(search, "i");
      query = query.find({
        $or: [
          { jobTitle: regex },
          { jobDescription: regex },
          { status: regex },
          { jobId: regex },
          { "departmentId.departmentName": regex },
          { "departmentId.departmentCode": regex },
          { "designationId.designationName": regex },
        ],
      });
    }

    const total = await Job.countDocuments(query.getQuery());

    const jobs = await query
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .select(
        "jobId jobTitle jobDescription status postingDate expiryDate isArchived applicationsCount createdAt updatedAt departmentId designationId"
      );

    return res.status(200).json({
      message: "Active job list fetched successfully",
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
      data: jobs,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return res.status(500).json({
      message: "Something went wrong while fetching jobs",
      error: error.message,
    });
  }
};

export const getArchivedJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const jobs = await Job.find({ isArchived: true })
      .populate("departmentId")
      .populate("designationId")
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Job.countDocuments({ isArchived: true });

    return res.status(200).json({
      message: "Archived job list fetched",
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      data: jobs,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id)
      .populate("departmentId")
      .populate("designationId");

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    return res.status(200).json({
      message: "Job fetched successfully",
      data: job,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    req.oldData = job.toObject();

    job.isArchived = true;
    await job.save();

    await logActivity(req.user._id, "Job", "DELETE", req.oldData, null, req);

    res.status(200).json({ message: "Job archived successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};