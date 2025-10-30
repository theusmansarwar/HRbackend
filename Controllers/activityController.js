
import ActivityLog from "../Models/activityModel.js";

export const getActivityList = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const search = req.query.search?.trim() || "";

    const baseFilter = {}; // no archive condition for activity logs (add if needed)

    let activities = await ActivityLog.find(baseFilter)
      .populate("userId", "firstName lastName email role")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    if (search) {
      const regex = new RegExp(search, "i");
      activities = activities.filter(
        (log) =>
          regex.test(log.action || "") ||
          regex.test(log.module || "") ||
          regex.test(log.userId?.firstName || "") ||
          regex.test(log.userId?.lastName || "") ||
          regex.test(log.userId?.email || "") ||
          regex.test(log.userId?.role || "")
      );
    }

    const total = await ActivityLog.countDocuments(baseFilter);

    return res.status(200).json({
      message: "Activity logs fetched successfully ✅",
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
      data: activities,
    });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return res.status(500).json({ error: "Server Error" });
  }
};
