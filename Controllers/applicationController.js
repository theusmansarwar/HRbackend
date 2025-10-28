import Application from "../Models/applicationModel.js";


// CREATE APPLICATION
export const createApplication = async (req, res) => {
  try {
    const {
      jobId,
      applicantName,
      applicantEmail,
      applicantPhone,
      resume,
      applicationDate,
      applicationStatus,
      interviewDate,
      remarks,
    } = req.body;

    const missingFields = [];

    if (!jobId?.trim())
      missingFields.push({ name: "jobId", message: "Job ID is required" });
    if (!applicantName?.trim())
      missingFields.push({ name: "applicantName", message: "Applicant Name is required" });
    if (!applicantEmail?.trim())
      missingFields.push({ name: "applicantEmail", message: "Applicant Email is required" });
    if (!applicantPhone?.trim())
      missingFields.push({ name: "applicantPhone", message: "Applicant Phone is required" });
    if (!resume?.trim())
      missingFields.push({ name: "resume", message: "Resume is required" });
    if (!applicationDate?.trim())
      missingFields.push({ name: "applicationDate", message: "Application Date is required" });
    if (!applicationStatus?.trim())
      missingFields.push({ name: "applicationStatus", message: "Application Status is required" });
    if (!remarks?.trim())
      missingFields.push({ name: "remarks", message: "Remarks are required" });
    if (!interviewDate?.trim())
      missingFields.push({ name: "interviewDate", message: "Interview Date is required" });

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Validation failed. Please fill all required fields.",
        missingFields,
      });
    }

    // Check for duplicate application
    const existingApplication = await Application.findOne({ applicantEmail });
    if (existingApplication) {
      return res.status(400).json({ error: "Application already exists" });
    }

    // Generate unique applicationId
    const lastApplication = await Application.findOne().sort({ createdAt: -1 });
    let newIdNumber = 1;
    if (lastApplication && lastApplication.applicationId) {
      const lastNumber = parseInt(lastApplication.applicationId.split("-")[1]);
      newIdNumber = lastNumber + 1;
    }
    const applicationId = `APP-${newIdNumber.toString().padStart(4, "0")}`;

    // Create new application
    const newApplication = await Application.create({
      applicationId,
      jobId,
      applicantName,
      applicantEmail,
      applicantPhone,
      resume,
      applicationDate,
      applicationStatus,
      interviewDate,
      remarks,
    });

    return res.status(201).json({
      status: 201,
      message: "Application created successfully ✅",
      data: newApplication,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Server error while creating application",
      details: error.message,
    });
  }
};

// UPDATE APPLICATION
export const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      jobId,
      applicantName,
      applicantEmail,
      applicantPhone,
      resume,
      applicationDate,
      applicationStatus,
      interviewDate,
      remarks,
    } = req.body;

    const missingFields = [];

    if (!jobId?.trim())
      missingFields.push({ name: "jobId", message: "Job ID is required" });
    if (!applicantName?.trim())
      missingFields.push({ name: "applicantName", message: "Applicant Name is required" });
    if (!applicantEmail?.trim())
      missingFields.push({ name: "applicantEmail", message: "Applicant Email is required" });
    if (!applicantPhone?.trim())
      missingFields.push({ name: "applicantPhone", message: "Applicant Phone is required" });
    if (!resume?.trim())
      missingFields.push({ name: "resume", message: "Resume is required" });
    if (!applicationDate?.trim())
      missingFields.push({ name: "applicationDate", message: "Application Date is required" });
    if (!applicationStatus?.trim())
      missingFields.push({ name: "applicationStatus", message: "Application Status is required" });
    if (!remarks?.trim())
      missingFields.push({ name: "remarks", message: "Remarks are required" });

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Validation failed. Please fill all required fields.",
        missingFields,
      });
    }

    const application = await Application.findById(id);
    if (!application)
      return res.status(404).json({ error: "Application not found" });

    application.jobId = jobId;
    application.applicantName = applicantName;
    application.applicantEmail = applicantEmail;
    application.applicantPhone = applicantPhone;
    application.resume = resume;
    application.applicationDate = applicationDate;
    application.applicationStatus = applicationStatus;
    application.interviewDate = interviewDate;
    application.remarks = remarks;

    const updatedApplication = await application.save();

    return res.status(200).json({
      status: 200,
      message: "Application updated successfully ✅",
      data: updatedApplication,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Server error while updating application",
      details: error.message,
    });
  }
};


// GET ACTIVE APPLICATION LIST (with pagination + populate)
 export const getApplicationList = async (req, res) => {
  try {
    // Extract query params
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const search = req.query.search || "";

    // Filter for active (non-archived) applications + search
    const filter = {
      isArchived: false,
      $or: [
        { applicantName: { $regex: search, $options: "i" } },
        { applicantEmail: { $regex: search, $options: "i" } },
        { applicantPhone: { $regex: search, $options: "i" } },
        { status: { $regex: search, $options: "i" } },
      ],
    };

    // Total count
    const total = await Application.countDocuments(filter);

    // Fetch with pagination + populate job info
    const applications = await Application.find(filter)
      .populate("jobId", "jobId")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    // Replace jobId object with its value
    const formattedApplications = applications.map((app) => ({
      ...app.toObject(),
      jobId: app.jobId?.jobId || null,
    }));

    // Send response
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


// GET ARCHIVED APPLICATION LIST
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

// GET SINGLE APPLICATION BY ID
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


// SOFT DELETE APPLICATION
export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if application exists
    const application = await Application.findById(id);
    if (!application)
      return res.status(404).json({ error: "Application not found" });

    // Archive application without triggering validation
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
};
