import Application from "../Models/applicationModel.js";
import path from "path";
import fs from "fs";

// ✅ PROFESSIONAL VALIDATION HELPERS
const ValidationRules = {
  // Name validation: Only letters, spaces, hyphens, and apostrophes
  name: {
    pattern: /^[a-zA-Z\s\-']+$/,
    minLength: 2,
    maxLength: 50,
    message: "Name must contain only letters, spaces, hyphens, and apostrophes (2-50 characters)",
  },
  
  // Email validation: Proper email format
  email: {
    pattern: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    message: "Please enter a valid email address (e.g., user@example.com)",
  },
  
  // Phone validation: 10-15 digits with optional +, spaces, hyphens, parentheses
  phone: {
    pattern: /^[\d\s\-\+\(\)]{10,15}$/,
    digitPattern: /\d/g,
    minDigits: 10,
    maxDigits: 15,
    message: "Phone number must contain 10-15 digits",
  },
  
  // Remarks validation
  remarks: {
    minLength: 5,
    maxLength: 500,
    message: "Remarks must be between 5-500 characters",
  },
  
  // File validation
  file: {
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    maxSize: 5 * 1024 * 1024, // 5MB
    message: "Only PDF and DOC/DOCX files are allowed (max 5MB)",
  },
};

// Validate name
const validateName = (name, fieldName = "Name") => {
  if (!name || !name.trim()) {
    return { valid: false, message: `${fieldName} is required` };
  }
  
  const trimmedName = name.trim();
  
  if (trimmedName.length < ValidationRules.name.minLength) {
    return { valid: false, message: `${fieldName} must be at least ${ValidationRules.name.minLength} characters` };
  }
  
  if (trimmedName.length > ValidationRules.name.maxLength) {
    return { valid: false, message: `${fieldName} must not exceed ${ValidationRules.name.maxLength} characters` };
  }
  
  if (!ValidationRules.name.pattern.test(trimmedName)) {
    return { valid: false, message: ValidationRules.name.message };
  }
  
  return { valid: true };
};

// Validate email
const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return { valid: false, message: "Email is required" };
  }
  
  const trimmedEmail = email.trim().toLowerCase();
  
  if (!ValidationRules.email.pattern.test(trimmedEmail)) {
    return { valid: false, message: ValidationRules.email.message };
  }
  
  return { valid: true };
};

// Validate phone
const validatePhone = (phone) => {
  if (!phone || !phone.trim()) {
    return { valid: false, message: "Phone number is required" };
  }
  
  const trimmedPhone = phone.trim();
  const digits = trimmedPhone.match(ValidationRules.phone.digitPattern);
  
  if (!digits || digits.length < ValidationRules.phone.minDigits || digits.length > ValidationRules.phone.maxDigits) {
    return { valid: false, message: ValidationRules.phone.message };
  }
  
  if (!ValidationRules.phone.pattern.test(trimmedPhone)) {
    return { valid: false, message: "Invalid phone number format" };
  }
  
  return { valid: true };
};

// Validate remarks
const validateRemarks = (remarks) => {
  if (!remarks || !remarks.trim()) {
    return { valid: false, message: "Remarks are required" };
  }
  
  const trimmedRemarks = remarks.trim();
  
  if (trimmedRemarks.length < ValidationRules.remarks.minLength) {
    return { valid: false, message: `Remarks must be at least ${ValidationRules.remarks.minLength} characters` };
  }
  
  if (trimmedRemarks.length > ValidationRules.remarks.maxLength) {
    return { valid: false, message: `Remarks must not exceed ${ValidationRules.remarks.maxLength} characters` };
  }
  
  return { valid: true };
};

// Validate file
const validateFile = (file) => {
  if (!file) {
    return { valid: false, message: "Resume is required" };
  }

  if (!ValidationRules.file.allowedTypes.includes(file.mimetype)) {
    return { valid: false, message: "Only PDF and DOC/DOCX files are allowed" };
  }

  if (file.size > ValidationRules.file.maxSize) {
    return { valid: false, message: "File size must be less than 5MB" };
  }

  return { valid: true };
};

// Validate date
const validateDate = (date, fieldName = "Date") => {
  if (!date || !date.trim()) {
    return { valid: false, message: `${fieldName} is required` };
  }
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return { valid: false, message: `Invalid ${fieldName} format` };
  }
  
  return { valid: true };
};

// ✅ CREATE APPLICATION WITH PROFESSIONAL VALIDATION
export const createApplication = async (req, res) => {
  try {
    const {
      jobId,
      applicantName,
      applicantEmail,
      applicantPhone,
      applicationDate,
      applicationStatus,
      interviewDate,
      remarks,
    } = req.body;

    const resume = req.file;
    const missingFields = [];

    // Validate Job ID
    if (!jobId?.trim()) {
      missingFields.push({ name: "jobId", message: "Job selection is required" });
    }

    // Validate Applicant Name
    const nameValidation = validateName(applicantName, "Applicant Name");
    if (!nameValidation.valid) {
      missingFields.push({ name: "applicantName", message: nameValidation.message });
    }

    // Validate Email
    const emailValidation = validateEmail(applicantEmail);
    if (!emailValidation.valid) {
      missingFields.push({ name: "applicantEmail", message: emailValidation.message });
    }

    // Validate Phone
    const phoneValidation = validatePhone(applicantPhone);
    if (!phoneValidation.valid) {
      missingFields.push({ name: "applicantPhone", message: phoneValidation.message });
    }

    // Validate Resume File
    const fileValidation = validateFile(resume);
    if (!fileValidation.valid) {
      if (req.file) {
        fs.unlinkSync(req.file.path); // Delete invalid file
      }
      return res.status(400).json({
        status: 400,
        message: fileValidation.message,
        missingFields: [{ name: "resume", message: fileValidation.message }],
      });
    }

    // Validate Application Date
    const appDateValidation = validateDate(applicationDate, "Application Date");
    if (!appDateValidation.valid) {
      missingFields.push({ name: "applicationDate", message: appDateValidation.message });
    }

    // Validate Application Status
    if (!applicationStatus?.trim()) {
      missingFields.push({ name: "applicationStatus", message: "Application Status is required" });
    }

    // Validate Interview Date
    const interviewDateValidation = validateDate(interviewDate, "Interview Date");
    if (!interviewDateValidation.valid) {
      missingFields.push({ name: "interviewDate", message: interviewDateValidation.message });
    }

    // Validate Remarks
    const remarksValidation = validateRemarks(remarks);
    if (!remarksValidation.valid) {
      missingFields.push({ name: "remarks", message: remarksValidation.message });
    }

    // Return all validation errors
    if (missingFields.length > 0) {
      if (req.file) {
        fs.unlinkSync(req.file.path); // Delete uploaded file if validation fails
      }
      return res.status(400).json({
        status: 400,
        message: "Validation failed. Please correct the errors.",
        missingFields,
      });
    }

    // Check for duplicate application
    const existingApplication = await Application.findOne({ 
      applicantEmail: applicantEmail.trim().toLowerCase(), 
      jobId 
    });
    
    if (existingApplication) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        status: 400,
        message: "You have already applied for this job",
        missingFields: [{ name: "applicantEmail", message: "Application already exists for this job" }],
      });
    }

    // Generate unique applicationId
    const lastApplication = await Application.findOne().sort({ createdAt: -1 });
    let newIdNumber = 1;
    if (lastApplication && lastApplication.applicationId) {
      const lastNumber = parseInt(lastApplication.applicationId.split("-")[1]);
      newIdNumber = lastNumber + 1;
    }
    const applicationId = `APP-${newIdNumber.toString().padStart(4, "0")}`;

    // Create application
    const newApplication = await Application.create({
      applicationId,
      jobId,
      applicantName: applicantName.trim(),
      applicantEmail: applicantEmail.trim().toLowerCase(),
      applicantPhone: applicantPhone.trim(),
      resume: resume.filename,
      applicationDate,
      applicationStatus,
      interviewDate,
      remarks: remarks.trim(),
    });

    return res.status(201).json({
      status: 201,
      message: "Application created successfully",
      data: newApplication,
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      status: 500,
      message: "Server error while creating application",
      details: error.message,
    });
  }
};

// ✅ UPDATE APPLICATION WITH PROFESSIONAL VALIDATION
export const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      jobId,
      applicantName,
      applicantEmail,
      applicantPhone,
      applicationDate,
      applicationStatus,
      interviewDate,
      remarks,
    } = req.body;

    const resume = req.file;
    const missingFields = [];

    // Validate Job ID
    if (!jobId?.trim()) {
      missingFields.push({ name: "jobId", message: "Job selection is required" });
    }

    // Validate Applicant Name
    const nameValidation = validateName(applicantName, "Applicant Name");
    if (!nameValidation.valid) {
      missingFields.push({ name: "applicantName", message: nameValidation.message });
    }

    // Validate Email
    const emailValidation = validateEmail(applicantEmail);
    if (!emailValidation.valid) {
      missingFields.push({ name: "applicantEmail", message: emailValidation.message });
    }

    // Validate Phone
    const phoneValidation = validatePhone(applicantPhone);
    if (!phoneValidation.valid) {
      missingFields.push({ name: "applicantPhone", message: phoneValidation.message });
    }

    // Validate Application Date
    const appDateValidation = validateDate(applicationDate, "Application Date");
    if (!appDateValidation.valid) {
      missingFields.push({ name: "applicationDate", message: appDateValidation.message });
    }

    // Validate Application Status
    if (!applicationStatus?.trim()) {
      missingFields.push({ name: "applicationStatus", message: "Application Status is required" });
    }

    // Validate Interview Date
    const interviewDateValidation = validateDate(interviewDate, "Interview Date");
    if (!interviewDateValidation.valid) {
      missingFields.push({ name: "interviewDate", message: interviewDateValidation.message });
    }

    // Validate Remarks
    const remarksValidation = validateRemarks(remarks);
    if (!remarksValidation.valid) {
      missingFields.push({ name: "remarks", message: remarksValidation.message });
    }

    // Return validation errors
    if (missingFields.length > 0) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        status: 400,
        message: "Validation failed. Please correct the errors.",
        missingFields,
      });
    }

    const application = await Application.findById(id);
    if (!application) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ error: "Application not found" });
    }

    // Validate and update resume if provided
    if (resume) {
      const fileValidation = validateFile(resume);
      if (!fileValidation.valid) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({
          status: 400,
          message: fileValidation.message,
          missingFields: [{ name: "resume", message: fileValidation.message }],
        });
      }

      // Delete old file
      const oldFilePath = path.join(process.cwd(), 'uploads', application.resume);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }

      application.resume = resume.filename;
    }

    // Update fields
    application.jobId = jobId;
    application.applicantName = applicantName.trim();
    application.applicantEmail = applicantEmail.trim().toLowerCase();
    application.applicantPhone = applicantPhone.trim();
    application.applicationDate = applicationDate;
    application.applicationStatus = applicationStatus;
    application.interviewDate = interviewDate;
    application.remarks = remarks.trim();

    const updatedApplication = await application.save();

    return res.status(200).json({
      status: 200,
      message: "Application updated successfully",
      data: updatedApplication,
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      status: 500,
      message: "Server error while updating application",
      details: error.message,
    });
  }
};

// Download resume
export const downloadResume = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), 'uploads', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    res.download(filePath);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Other functions remain the same...
export const getApplicationList = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const search = req.query.search || "";

    const filter = {
      isArchived: false,
      $or: [
        { applicantName: { $regex: search, $options: "i" } },
        { applicantEmail: { $regex: search, $options: "i" } },
        { applicantPhone: { $regex: search, $options: "i" } },
        { applicationStatus: { $regex: search, $options: "i" } },
      ],
    };

    const total = await Application.countDocuments(filter);

    const applications = await Application.find(filter)
      .populate("jobId", "jobId")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const formattedApplications = applications.map((app) => ({
      ...app.toObject(),
      jobId: app.jobId?.jobId || null,
    }));

    return res.status(200).json({
      message: "Active application list fetched",
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
      data: formattedApplications,
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return res.status(500).json({ error: "Server Error" });
  }
};

export const getArchivedApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const filter = { isArchived: true };

    const applications = await Application.find(filter)
      .populate("jobId")
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Application.countDocuments(filter);

    return res.status(200).json({
      message: "Archived application list fetched",
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      data: applications,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findById(id).populate("jobId");
    if (!application) return res.status(404).json({ error: "Application not found" });

    return res.status(200).json({
      message: "Application fetched successfully",
      data: application,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findById(id);
    if (!application)
      return res.status(404).json({ error: "Application not found" });

    await Application.updateOne({ _id: id }, { isArchived: true });

    return res.status(200).json({
      message: "Application archived successfully",
    });
  } catch (error) {
    console.error("Delete Application Error:", error);
    return res.status(500).json({ error: error.message });
  }
};

export default {
  createApplication,
  getApplicationList,
  getArchivedApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  downloadResume,
};