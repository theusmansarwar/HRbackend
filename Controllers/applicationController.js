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

    // VALIDATIONS
    if (!jobId) return res.status(400).json({ error: "Job ID is required" });
    if (!applicantName) return res.status(400).json({ error: "Applicant Name is required" });
    if (!applicantEmail) return res.status(400).json({ error: "Applicant Email is required" });
    if (!applicantPhone) return res.status(400).json({ error: "Applicant Phone is required" });
    if (!resume) return res.status(400).json({ error: "Resume is required" });
    if (!applicationDate) return res.status(400).json({ error: "Application Date is required" });
    if (!applicationStatus) return res.status(400).json({ error: "Application Status is required" });
    if (!remarks) return res.status(400).json({ error: "Remarks are required" });

    // Check if application already exists
    const existingApplication = await Application.findOne({ applicantEmail});
    if (existingApplication) {
      return res.status(400).json({ error: "Application already exists" });
    }

    // Generate unique applicationId like "APP-0001"
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
      message: "Application created successfully",
      data: newApplication,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Something went wrong while creating application",
      details: error.message,
    });
  }
};

// GET ACTIVE APPLICATION LIST (with pagination + populate)
export const getApplicationList = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const filter = { isArchived: false };

    // Fetch applications with populated job info
    const applications = await Application.find(filter)
      .populate("jobId", "jobId") // ✅ only fetch the auto-increment jobId
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    // Replace jobId object with its string value
    const formattedApplications = applications.map((app) => ({
      ...app.toObject(),
      jobId: app.jobId?.jobId || null, // 
    }));

    const total = await Application.countDocuments(filter);

    return res.status(200).json({
      message: "Active application list fetched",
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      data: formattedApplications,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
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

    if (!jobId) return res.status(400).json({ error: "Job ID is required" });
    if (!applicantName) return res.status(400).json({ error: "Applicant Name is required" });
    if (!applicantEmail) return res.status(400).json({ error: "Applicant Email is required" });
    if (!applicantPhone) return res.status(400).json({ error: "Applicant Phone is required" });
    if (!resume) return res.status(400).json({ error: "Resume is required" });
    if (!applicationDate) return res.status(400).json({ error: "Application Date is required" });
    if (!applicationStatus) return res.status(400).json({ error: "Application Status is required" });
    if (!remarks) return res.status(400).json({ error: "Remarks are required" });

    const application = await Application.findById(id);
    if (!application) return res.status(404).json({ error: "Application not found" });

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
      message: "Application updated successfully",
      data: updatedApplication,
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
