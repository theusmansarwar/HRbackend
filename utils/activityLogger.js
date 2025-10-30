import ActivityLog from "../Models/activityModel.js";

export const logActivity = async (userId, module, action, oldData = null, newData = null) => {
  try {
    await ActivityLog.create({
      userId,
      module,
      action,
      oldData,
      newData,
      createdAt: new Date(),
    });
  } catch (err) {
    console.error("Activity log error:", err.message);
  }
};
