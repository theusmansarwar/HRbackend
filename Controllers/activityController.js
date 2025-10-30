// Controllers/activityController.js
import ActivityLog from "../Models/activityModel.js";

export const getActivities = async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(50);
    res.status(200).json({ status: "success", data: logs });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
