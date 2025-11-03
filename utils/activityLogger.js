import ActivityLog from "../Models/activityModel.js";
import User from "../Models/User.js";  

export const logActivity = async (userId, module, action, oldData = null, newData = null, req = null) => {
  try {
    console.log("🔍 logActivity called with:", { userId, module, action });
    
    // ✅ Fixed: Select 'name' instead of 'firstName lastName'
    const user = await User.findById(userId).select("name email role");
    
    console.log("👤 User found:", user);

    if (!user) {
      console.error("❌ User not found with ID:", userId);
      return;
    }

    // ✅ Fixed: Use user.name directly
    const activity = {
      user: {
        userId,
        userName: user?.name || user?.email?.split('@')[0] || "Unknown", // ✅ Fallback to email username
        userEmail: user?.email || "Unknown",
        userRole: user?.role || "N/A",
      },
      action: action.toUpperCase(),
      module,
      recordId: newData?._id || oldData?._id || null,
      description: `${module} ${action} performed`,
      changes: {
        oldValues: oldData || null,
        newValues: newData || null,
      },
      request: {
        ipAddress: req?.ip || null,
        userAgent: req?.headers["user-agent"] || null,
        method: req?.method || null,
        url: req?.originalUrl || null,
      },
    };

    console.log("📝 Activity to save:", JSON.stringify(activity, null, 2));

    const savedActivity = await ActivityLog.create(activity);
    console.log(`✅ Activity logged successfully with ID:`, savedActivity._id);
  } catch (err) {
    console.error("❌ Activity log error:", err.message);
    console.error("❌ Full error:", err);
  }
};