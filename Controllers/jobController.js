import Job from "../Models/jobModel.js";

// CREATE JOB
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
      socialMediaLinks,
    } = req.body;

    // VALIDATIONS
    if (!jobTitle)
      return res.status(400).json({ error: "Job Title is required" });
    if (!jobDescription)
      return res.status(400).json({ error: "Job Description is required" });
    if (!departmentId)
      return res.status(400).json({ error: "DepartmentId is required" });
    if (!designationId)
      return res.status(400).json({ error: "DesignationId is required" });
    if (!status) return res.status(400).json({ error: "Status is required" });
    if (!postingDate)
      return res.status(400).json({ error: "Posting Date is required" });
    if (!expiryDate)
      return res.status(400).json({ error: "Expiry Date is required" });

    //  Generate unique jobId like "JOB-0001"
    const lastJob = await Job.findOne().sort({ createdAt: -1 });
    let newIdNumber = 1;
    if (lastJob && lastJob.jobId) {
      const lastNumber = parseInt(lastJob.jobId.split("-")[1]);
      newIdNumber = lastNumber + 1;
    }
    const jobId = `JOB-${newIdNumber.toString().padStart(4, "0")}`;

    // Create new job
    const job = await Job.create({
      jobId,
      jobTitle,
      jobDescription,
      departmentId,
      designationId,
      postedBy,
      status,
      postingDate,
      expiryDate,
      socialMediaLinks,
    });

    return res.status(201).json({
      status: 201,
      message: "Job created successfully",
      data: job,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Something went wrong while creating job",
      details: error.message,
    });
  }
};
// READ ACTIVE JOB LIST (with pagination + populate)
export const getJobList = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const jobs = await Job.find({ isArchived: false })
      .populate({
        path: "departmentId",
        model: "Department",
        select: "departmentName departmentCode",
      })
      .populate({
        path: "designationId",
        model: "Designation",
        select: "designationName",
      })
      .sort({ createdAt: -1 });

    const total = await Job.countDocuments({ isArchived: false });

    return res.status(200).json({
      message: "Active job list fetched",
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      data: jobs,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// READ ARCHIVED JOB LIST (with pagination + populate)
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

// GET SINGLE JOB BY ID (with populate)
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

// UPDATE JOB
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
      socialMediaLinks,
    } = req.body;

    // VALIDATIONS
    if (!jobTitle) return res.json({ error: "Job Title is required" });
    if (!jobDescription)
      return res.json({ error: "Job Description is required" });
    if (!departmentId) return res.json({ error: "DepartmentId is required" });
    if (!designationId) return res.json({ error: "DesignationId is required" });
    if (!status) return res.json({ error: "Status is required" });
    if (!postingDate) return res.json({ error: "Posting Date is required" });
    if (!expiryDate) return res.json({ error: "Expiry Date is required" });

    const updatedJob = await Job.findByIdAndUpdate(
      id,
      {
        jobTitle,
        jobDescription,
        departmentId,
        designationId,
        postedBy,
        status,
        postingDate,
        expiryDate,
        socialMediaLinks,
      },
      { new: true }
    )
      .populate("departmentId")
      .populate("designationId");

    if (!updatedJob) {
      return res.status(404).json({ error: "Job not found" });
    }

    return res.json({
      status: 200,
      message: "Job updated successfully",
      data: updatedJob,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// SOFT DELETE JOB
export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    job.isArchived = true; // mark as archived instead of deleting
    await job.save();

    res.status(200).json({ message: "Job archived successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// module.exports = {
//   createJob,
//   getJobList,
//   getArchivedJobs,
//   getJobById,
//   updateJob,
//   deleteJob,
// };
