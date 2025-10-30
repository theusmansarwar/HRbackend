import Job from "../Models/jobModel.js";

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

    if (!jobTitle)
      missingFields.push({ name: "jobTitle", message: "Job Title is required" });
    if (!jobDescription)
      missingFields.push({
        name: "jobDescription",
        message: "Job Description is required",
      });
    if (!departmentId)
      missingFields.push({
        name: "departmentId",
        message: "Department is required",
      });
    if (!designationId)
      missingFields.push({
        name: "designationId",
        message: "Designation is required",
      });
    if (!status)
      missingFields.push({ name: "status", message: "Status is required" });
    if (!postingDate)
      missingFields.push({
        name: "postingDate",
        message: "Posting Date is required",
      });
    if (!expiryDate)
      missingFields.push({
        name: "expiryDate",
        message: "Expiry Date is required",
      });
 
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Validation failed. Some fields are missing.",
        missingFields,
      });
    }

   
    const lastJob = await Job.findOne().sort({ createdAt: -1 });
    let newIdNumber = 1;
    if (lastJob?.jobId) {
      const lastNumber = parseInt(lastJob.jobId.split("-")[1]);
      newIdNumber = lastNumber + 1;
    }
    const jobId = `JOB-${newIdNumber.toString().padStart(4, "0")}`;
 
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
    });

    return res.status(201).json({
      status: 201,
      message: "Job created successfully ",
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

     if (!jobTitle?.trim())
  missingFields.push({ name: "jobTitle", message: "Job Title is required" });

if (!jobDescription?.trim())
  missingFields.push({
    name: "jobDescription",
    message: "Job Description is required",
  });

if (!departmentId?.trim())
  missingFields.push({
    name: "departmentId",
    message: "Department is required",
  });

if (!designationId?.trim())
  missingFields.push({
    name: "designationId",
    message: "Designation is required",
  });

if (!status?.trim())
  missingFields.push({ name: "status", message: "Status is required" });

if (!postingDate?.trim())
  missingFields.push({
    name: "postingDate",
    message: "Posting Date is required",
  });

if (!expiryDate?.trim())
  missingFields.push({
    name: "expiryDate",
    message: "Expiry Date is required",
  });


    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Validation failed. Some fields are missing.",
        missingFields,
      });
    }

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

    return res.status(200).json({
      status: 200,
      message: "Job updated successfully ",
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

    let pipeline = [
      { $match: baseFilter },
      {
        $lookup: {
          from: "departments",
          localField: "departmentId",
          foreignField: "_id",
          as: "departmentInfo",
        },
      },
      {
        $lookup: {
          from: "designations",
          localField: "designationId",
          foreignField: "_id",
          as: "designationInfo",
        },
      },
      { $unwind: { path: "$departmentInfo", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$designationInfo", preserveNullAndEmptyArrays: true } },
    ];

    if (search) {
      const regex = new RegExp(search, "i");
      pipeline.push({
        $match: {
          $or: [
            { jobTitle: regex },
            { jobDescription: regex },
            { status: regex },
            { jobId: regex },
            { "departmentInfo.departmentName": regex },
            { "departmentInfo.departmentCode": regex },
            { "designationInfo.designationName": regex },
          ],
        },
      });
    }

    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await Job.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    pipeline.push(
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    );

    pipeline.push({
      $project: {
        _id: 1,
        jobId: 1,
        jobTitle: 1,
        jobDescription: 1,
        status: 1,
        postingDate: 1,
        expiryDate: 1,
        isArchived: 1,
        applicationsCount: 1,
        createdAt: 1,
        updatedAt: 1,
        departmentId: {
          _id: "$departmentInfo._id",
          departmentName: "$departmentInfo.departmentName",
          departmentCode: "$departmentInfo.departmentCode",
        },
        designationId: {
          _id: "$designationInfo._id",
          designationName: "$designationInfo.designationName",
        },
      },
    });

    const jobs = await Job.aggregate(pipeline);

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

    job.isArchived = true;
    await job.save();

    res.status(200).json({ message: "Job archived successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};