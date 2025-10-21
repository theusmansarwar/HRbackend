const Application = require("../Models/applicationModel");

const createApplication = async (req, res) => {
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

  if (!jobId) return res.json({ error: "Job ID is required" });
  if (!applicantName) return res.json({ error: "Applicant Name is required" });
  if (!applicantEmail) return res.json({ error: "Applicant Email is required" });
  if (!applicantPhone) return res.json({ error: "Applicant Phone is required" });
  if (!resume) return res.json({ error: "Resume is required" });
  if (!applicationDate) return res.json({ error: "Application Date is required" });
  if (!applicationStatus) return res.json({ error: "Application Status is required" });
  if (!remarks) return res.json({ error: "Remarks is required" });

  try {
    const existingApplication = await Application.findOne({ applicantEmail, jobId });
    if (existingApplication) {
      return res.json({ error: "Application already exists for this job" });
    }

    const newApplication = await Application.create({
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

    return res.json({
      status: 200,
      message: "Application Created",
      data: newApplication,
    });
  } catch (error) {
    return res.status(500).json({ error: "Server Error" });
  }
};

const getApplicationList = async (req, res) => {
  try {
    // Pagination params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const filter = { isArchived: false };

    const applications = await Application.find(filter)
      .populate("jobId")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const totalApplications = await Application.countDocuments(filter);

    return res.status(200).json({
      message: "Application List Fetched",
      totalApplications,
      totalPages: Math.ceil(totalApplications / limit),
      currentPage: page,
      limit: limit,
      data: applications,
    });
  } catch (error) {
    return res.status(500).json({ error: "Server Error" });
  }
};

const getArchivedApplications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const filter = { isArchived: true };

    const archivedApplications = await Application.find(filter)
      .populate("jobId")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const totalArchived = await Application.countDocuments(filter);

    return res.status(200).json({
      message: "Archived Applications",
      totalArchived,
      totalPages: Math.ceil(totalArchived / limit),
      currentPage: page,
      limit: limit,
      data: archivedApplications,
    });
  } catch (error) {
    return res.status(500).json({ error: "Server Error" });
  }
};

const updateApplication = async (req, res) => {
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

    if (!jobId) return res.json({ error: "Job ID is required" });
    if (!applicantName) return res.json({ error: "Applicant Name is required" });
    if (!applicantEmail) return res.json({ error: "Applicant Email is required" });
    if (!applicantPhone) return res.json({ error: "Applicant Phone is required" });
    if (!resume) return res.json({ error: "Resume is required" });
    if (!applicationDate) return res.json({ error: "Application Date is required" });
    if (!applicationStatus) return res.json({ error: "Application Status is required" });
    if (!remarks) return res.json({ error: "Remarks is required" });

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
    return res.json({ status: 200, message: "Application updated successfully", data: updatedApplication });
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
};

const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id);
    if (!application) return res.status(404).json({ error: "Application not found" });

    application.isArchived = true;
    await application.save();

    return res.json({ status: 200, message: "Application archived successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createApplication,
  getApplicationList,
  getArchivedApplications,
  updateApplication,
  deleteApplication,
};
