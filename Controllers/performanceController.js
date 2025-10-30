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

    const lastPerformance = await Performance.findOne().sort({ createdAt: -1 });
    let newIdNumber = 1;
    if (lastPerformance?.performanceId) {
      const lastNumber = parseInt(lastPerformance.performanceId.split("-")[1]);
      newIdNumber = lastNumber + 1;
    }
    const performanceId = `PERF-${newIdNumber.toString().padStart(4, "0")}`;

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
      message: "Performance created successfully",
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

export const getPerformanceList = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const search = req.query.search?.trim() || "";
    const skip = (page - 1) * limit;

    const baseFilter = { status: { $ne: "Archived" } };

    let pipeline = [
      { $match: baseFilter },
      {
        $lookup: {
          from: "employees",
          localField: "employeeId",
          foreignField: "_id",
          as: "employeeInfo",
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "reviewerId",
          foreignField: "_id",
          as: "reviewerInfo",
        },
      },
      { $unwind: { path: "$employeeInfo", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$reviewerInfo", preserveNullAndEmptyArrays: true } },
    ];

    if (search) {
      const regex = new RegExp(search, "i");
      pipeline.push({
        $match: {
          $or: [
            { performanceId: regex },                 
            { remarks: regex },                      
            { status: regex },
            { KPIs: regex },                          
            { "employeeInfo.firstName": regex },      
            { "employeeInfo.lastName": regex },        
            { "employeeInfo.email": regex },           
            { "employeeInfo.employeeId": regex },     
            { "reviewerInfo.firstName": regex },      
            { "reviewerInfo.lastName": regex },        
            { "reviewerInfo.email": regex },           
            { $expr: { $regexMatch: { input: { $toString: "$score" }, regex: search, options: "i" } } }, // Score as string
          ],
        },
      });
    }
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await Performance.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    pipeline.push(
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    );

    pipeline.push({
      $project: {
        _id: 1,
        performanceId: 1,
        KPIs: 1,
        appraisalDate: 1,
        score: 1,
        remarks: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,
        employeeId: {
          _id: "$employeeInfo._id",
          firstName: "$employeeInfo.firstName",
          lastName: "$employeeInfo.lastName",
          email: "$employeeInfo.email",
          employeeId: "$employeeInfo.employeeId",
        },
        reviewerId: {
          _id: "$reviewerInfo._id",
          firstName: "$reviewerInfo.firstName",
          lastName: "$reviewerInfo.lastName",
          email: "$reviewerInfo.email",
        },
      },
    });

    const performanceList = await Performance.aggregate(pipeline);

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
      message: "Error fetching performance records",
      error: error.message 
    });
  }
};

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

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Validation failed. Some fields are missing.",
        missingFields,
      });
    }

    const performanceRecord = await Performance.findById(id);
    if (!performanceRecord) {
      return res.status(404).json({ message: "Performance record not found" });
    }

    const employeeExists = await Employee.findById(employeeId);
    if (!employeeExists) {
      return res.status(404).json({ message: "Employee not found" });
    }

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
      message: "Performance updated successfully",
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
