import Designation from "../Models/designationModel.js";

export const createDesignation = async (req, res) => {
  try {
    const { designationName, departmentId, status } = req.body;

    // ✅ Collect missing fields with messages
    const missingFields = [];
    if (!designationName)
      missingFields.push({
        name: "designationName",
        message: "Designation Name is required",
      });
    if (!departmentId)
      missingFields.push({
        name: "departmentId",
        message: "Department selection is required",
      });
    if (!status)
      missingFields.push({
        name: "status",
        message: "Status is required",
      });

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Missing required fields",
        missingFields,
      });
    }

    // ✅ Duplicate check
    const existingDesignation = await Designation.findOne({
      designationName,
      departmentId,
      archive: false,
    });

    if (existingDesignation) {
      return res.status(400).json({
        status: 400,
        message: "Duplicate entry",
        missingFields: [
          {
            name: "designationName",
            message: "This designation already exists in the selected department",
          },
        ],
      });
    }

    // ✅ Auto-generate ID: DSG-0001
    const lastDesignation = await Designation.findOne().sort({ createdAt: -1 });
    let newIdNumber = 1;
    if (lastDesignation && lastDesignation.designationId) {
      const lastNumber = parseInt(lastDesignation.designationId.split("-")[1]);
      if (!isNaN(lastNumber)) newIdNumber = lastNumber + 1;
    }

    const designationId = `DSG-${newIdNumber.toString().padStart(4, "0")}`;

    // ✅ Create new record
    const designation = await Designation.create({
      designationId,
      designationName,
      departmentId,
      status,
      archive: false,
    });

    return res.status(201).json({
      status: 201,
      message: "Designation created successfully",
      data: designation,
    });
  } catch (error) {
    console.error("Error creating designation:", error);
    return res.status(500).json({
      status: 500,
      message: "Something went wrong while creating designation",
      details: error.message,
    });
  }
};


const getDesignationList = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const search = req.query.search?.trim() || "";

    const baseFilter = { archive: false };

    let designations = await Designation.find(baseFilter)
      .populate("departmentId", "departmentName")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    if (search) {
      const regex = new RegExp(search, "i");
      designations = designations.filter(
        (d) =>
          regex.test(d.designationName || "") ||
          regex.test(d.departmentId?.departmentName || "")
      );
    }

    const total = await Designation.countDocuments(baseFilter);

    return res.status(200).json({
      message: "Active designations fetched successfully",
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
      data: designations,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server Error" });
  }
};

const getArchivedDesignations = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const designations = await Designation.find({ archive: true })
      .populate("departmentId", "departmentName")
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Designation.countDocuments({ archive: true });

    return res.status(200).json({
      message: "Archived Designations Fetched",
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      data: designations,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateDesignation = async (req, res) => {
  try {
    const { id } = req.params;
    const { designationName, departmentId, status } = req.body;

    const designation = await Designation.findById(id);
    if (!designation) {
      return res.status(404).json({
        status: 404,
        message: "Designation not found",
      });
    }
    const missingFields = [];
    if (!designationName)
      missingFields.push({
        name: "designationName",
        message: "Designation Name is required",
      });
    if (!departmentId)
      missingFields.push({
        name: "departmentId",
        message: "Department selection is required",
      });
    if (!status)
      missingFields.push({
        name: "status",
        message: "Status is required",
      });

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Missing required fields",
        missingFields,
      });
    }

    Object.assign(designation, req.body, { updatedDate: new Date() });
    const updatedDesignation = await designation.save();

    return res.status(200).json({
      status: 200,
      message: "Designation updated successfully",
      data: updatedDesignation,
    });
  } catch (error) {
    console.error("Error updating designation:", error);
    return res.status(500).json({
      status: 500,
      message: "Something went wrong while updating designation",
      details: error.message,
    });
  }
};


const deleteDesignation = async (req, res) => {
  try {
    const { id } = req.params;
    const designation = await Designation.findById(id);

    if (!designation) {
      return res.status(404).json({ error: "Designation not found" });
    }

    designation.archive = true;
    await designation.save();

    return res.status(200).json({
      message: "Designation archived successfully",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export {
  getDesignationList,
  getArchivedDesignations,
  deleteDesignation,
};
