import ActivityLog from "../Models/activityModel.js";

export const getActivityList = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const search = req.query.search?.trim() || "";
    const skip = (page - 1) * limit;

    console.log("📍 Fetching activities - Page:", page, "Limit:", limit, "Search:", search);

    // ✅ Build search filter
    let filter = {};
    if (search) {
      const regex = new RegExp(search, "i");
      filter = {
        $or: [
          { action: regex },
          { module: regex },
          { description: regex },
          { "user.userName": regex },
          { "user.userEmail": regex },
          { "user.userRole": regex },
        ],
      };
    }

    // Get total count with filter
    const total = await ActivityLog.countDocuments(filter);

    // ✅ Fetch activities WITHOUT populate (data already embedded)
    const activities = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-__v") // Remove __v field
      .lean(); // Convert to plain JS objects

    console.log("✅ Activities fetched:", activities.length);

    return res.status(200).json({
      status: "success",
      message: "Activity logs fetched successfully ✅",
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
      data: activities,
    });
  } catch (error) {
    console.error("❌ Error fetching activities:", error);
    console.error("❌ Error stack:", error.stack);
    return res.status(500).json({
      status: "error",
      message: "Server error while fetching activities",
      error: error.message,
    });
  }
};