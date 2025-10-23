import Fine from "../Models/fineModel.js";
import Employee from "../Models/employeeModel.js";

// =============================
// CREATE FINE (Auto Increment ID)
// =============================
export const createFine = async (req, res) => {
  try {
    const {
      employeeId,
      fineType,
      fineAmount,
      fineDate,
      description,
      status,
    } = req.body;

    const lastFine = await Fine.findOne().sort({ createdAt: -1 });
    let newIdNumber = 1;

    if (lastFine && lastFine.fineId) {
      const lastNumber = parseInt(lastFine.fineId.split("-")[1]);
      if (!isNaN(lastNumber)) {
        newIdNumber = lastNumber + 1;
      }
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
      message: "Fine created successfully",
      data: fine,
    });
  } catch (error) {
    console.error("Error creating fine:", error);
    return res.status(500).json({ error: error.message });
  }
};
// =============================
// GET ALL ACTIVE FINES
// =============================
// export const getFineList = async (req, res) => {
//   try {
//     const { page = 1, limit = 10 } = req.query;
//     const skip = (page - 1) * limit;

//     const filter = { archiveFine: false };

//     const fines = await Fine.find(filter)
//       .populate("employeeId", "firstName lastName email")
//       .sort({ createdAt: -1 })
//       .skip(parseInt(skip))
//       .limit(parseInt(limit));

//     const total = await Fine.countDocuments(filter);

//     return res.status(200).json({
//       message: "Active fines fetched successfully",
//       total,
//       page: parseInt(page),
//       limit: parseInt(limit),
//       data: fines,
//     });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };
export const getFineList = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const search = req.query.search?.trim() || "";

    // Base filter for non-archived fines
    const baseFilter = { archiveFine: false };

    // Fetch fines with employee info (populate first)
    let fines = await Fine.find(baseFilter)
      .populate("employeeId", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Manual search filter (because populate is post-query)
    if (search) {
      const regex = new RegExp(search, "i");
      fines = fines.filter(
        (fine) =>
          regex.test(fine.fineReason) ||
          regex.test(String(fine.fineAmount)) ||
          regex.test(fine.employeeId?.firstName || "") ||
          regex.test(fine.employeeId?.lastName || "") ||
          regex.test(fine.employeeId?.email || "")
      );
    }

    const total = await Fine.countDocuments(baseFilter);

    return res.status(200).json({
      message: "Active fines fetched successfully ✅",
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
      data: fines,
    });
  } catch (error) {
    console.error("Error fetching fines:", error);
    return res.status(500).json({ error: "Server Error" });
  }
};



// =============================
// GET ARCHIVED FINES
// =============================
export const getArchivedFines = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const filter = { archiveFine: true };

    const archived = await Fine.find(filter)
      .populate("employeeId", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Fine.countDocuments(filter);

    return res.status(200).json({
      message: "Archived fines fetched successfully",
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      data: archived,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// =============================
// UPDATE FINE
// =============================
export const updateFine = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fineType,
      fineAmount,
      fineDate,
      description,
      status,
      archiveFine,
    } = req.body;

    const fine = await Fine.findById(id);
    if (!fine) return res.status(404).json({ error: "Fine not found" });

    fine.fineType = fineType || fine.fineType;
    fine.fineAmount = fineAmount ?? fine.fineAmount;
    fine.fineDate = fineDate || fine.fineDate;
    fine.description = description || fine.description;
    fine.status = status || fine.status;
    fine.archiveFine = archiveFine ?? fine.archiveFine;

    const updated = await fine.save();

    return res.status(200).json({
      message: "Fine updated successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// =============================
// SOFT DELETE (ARCHIVE) FINE
// =============================
export const deleteFine = async (req, res) => {
  try {
    const { id } = req.params;

    const fine = await Fine.findById(id);
    if (!fine) return res.status(404).json({ error: "Fine not found" });

    fine.archiveFine = true;
    await fine.save();

    return res.status(200).json({ message: "Fine archived successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
