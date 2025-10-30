// Controllers/fineController.js
import Fine from "../Models/fineModel.js";
import Employee from "../Models/employeeModel.js";


export const createFine = async (req, res) => {
  try {
    const { employeeId, fineType, fineAmount, fineDate, description, status } = req.body;

    const missingFields = [];

    if (!employeeId)
      missingFields.push({ name: "employeeId", message: "Employee is required" });
    if (!fineType)
      missingFields.push({ name: "fineType", message: "Fine type is required" });
    if (!fineAmount)
      missingFields.push({ name: "fineAmount", message: "Fine amount is required" });
    if (!fineDate)
      missingFields.push({ name: "fineDate", message: "Fine date is required" });
    if (!description)
      missingFields.push({ name: "description", message: "Description is required" });

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Missing required fields",
        missingFields,
      });
    }

  
    const lastFine = await Fine.findOne().sort({ createdAt: -1 });
    let newIdNumber = 1;
    if (lastFine?.fineId) {
      const lastNumber = parseInt(lastFine.fineId.split("-")[1]);
      if (!isNaN(lastNumber)) newIdNumber = lastNumber + 1;
    }

    const fineId = `FINE-${newIdNumber.toString().padStart(4, "0")}`;

    const fine = new Fine({
      fineId,
      employeeId,
      fineType,
      fineAmount,
      fineDate,
      description,
      status,
    });

    await fine.save();

    return res.status(201).json({
      status: 201,
      message: "Fine created successfully",
      data: fine,
    });
  } catch (error) {
    console.error("Error creating fine:", error);
    return res.status(500).json({
      status: 500,
      message: "Server error while creating fine",
    });
  }
};
 
export const updateFine = async (req, res) => {
  try {
    const { id } = req.params;
    let { employeeId, fineType, fineAmount, fineDate, description, status } = req.body;

    employeeId = employeeId?.trim();
    fineType = fineType?.trim();
    fineAmount = fineAmount?.toString().trim();
    fineDate = fineDate?.trim();
    description = description?.trim();
    status = status?.trim();


    const missingFields = [];

    if (!employeeId)
      missingFields.push({ name: "employeeId", message: "Employee is required" });

    if (!fineType)
      missingFields.push({ name: "fineType", message: "Fine type is required" });

    if (!fineAmount || isNaN(fineAmount) || Number(fineAmount) <= 0)
      missingFields.push({
        name: "fineAmount",
        message: "Fine amount must be a valid positive number",
      });

    if (!fineDate || isNaN(Date.parse(fineDate)))
      missingFields.push({
        name: "fineDate",
        message: "Fine date is required and must be valid",
      });

    if (!description)
      missingFields.push({
        name: "description",
        message: "Description is required",
      });

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Validation failed. Some fields are missing or invalid.",
        missingFields,
      });
    }

    const fine = await Fine.findById(id);
    if (!fine) {
      return res.status(404).json({
        status: 404,
        message: "Fine not found",
      });
    }

    req.oldData = fine.toObject();

    fine.employeeId = employeeId;
    fine.fineType = fineType;
    fine.fineAmount = Number(fineAmount);
    fine.fineDate = new Date(fineDate);
    fine.description = description;
    fine.status = status || "Unpaid";

    const updatedFine = await fine.save();

    return res.status(200).json({
      status: 200,
      message: "Fine updated successfully",
      data: updatedFine,
    });
  } catch (error) {
    console.error("Error updating fine:", error);

    if (error.name === "ValidationError") {
      const missingFields = Object.keys(error.errors).map((key) => ({
        name: key,
        message: `${key.charAt(0).toUpperCase() + key.slice(1)} is required`,
      }));

      return res.status(400).json({
        status: 400,
        message: "Validation failed",
        missingFields,
      });
    }

    return res.status(500).json({
      status: 500,
      message: "Server error while updating fine",
      details: error.message,
    });
  }
};

export const getFineList = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const search = req.query.search?.trim() || "";
    const skip = (page - 1) * limit;

    const baseFilter = { archiveFine: false };

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
      { $unwind: { path: "$employeeInfo", preserveNullAndEmptyArrays: true } },
    ];

    if (search) {
      const regex = new RegExp(search, "i");
      pipeline.push({
        $match: {
          $or: [
            { fineId: regex },                        
            { fineType: regex },                       
            { description: regex },                   
            { status: regex },                        
            { "employeeInfo.firstName": regex },      
            { "employeeInfo.lastName": regex },       
            { "employeeInfo.email": regex },         
            
            { $expr: { $regexMatch: { input: { $toString: "$fineAmount" }, regex: search, options: "i" } } }, // Fine amount as string
          ],
        },
      });
    }

    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await Fine.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    pipeline.push(
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    );

    pipeline.push({
      $project: {
        _id: 1,
        fineId: 1,
        fineType: 1,
        fineAmount: 1,
        fineDate: 1,
        description: 1,
        status: 1,
        archiveFine: 1,
        createdAt: 1,
        updatedAt: 1,
        employeeId: {
          _id: "$employeeInfo._id",
          firstName: "$employeeInfo.firstName",
          lastName: "$employeeInfo.lastName",
          email: "$employeeInfo.email",
        },
      },
    });

    const fines = await Fine.aggregate(pipeline);

    return res.status(200).json({
      status: "success",
      message: "Active fines fetched successfully",
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
      data: fines,
    });
  } catch (error) {
    console.error("Error fetching fines:", error);
    return res.status(500).json({
      status: "error",
      message: "Server error while fetching fines",
      error: error.message,
    });
  }
};

export const getArchivedFines = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const filter = { archiveFine: true };

    const archived = await Fine.find(filter)
      .populate("employeeId", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Fine.countDocuments(filter);

    return res.status(200).json({
      status: "success",
      message: "Archived fines fetched successfully ✅",
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      data: archived,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Server error while fetching archived fines",
    });
  }
};


export const deleteFine = async (req, res) => {
  try {
    const { id } = req.params;

    const fine = await Fine.findById(id);
    if (!fine) {
      return res.status(404).json({
        status: "error",
        message: "Fine not found",
      });
    }

    req.oldData = fine.toObject();

    fine.archiveFine = true;
    await fine.save();

    return res.status(200).json({
      status: "success",
      message: "Fine archived successfully ✅",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Server error while archiving fine",
    });
  }
};
