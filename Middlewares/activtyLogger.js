import ActivityLog from "../Models/activityModel.js";

// 🔹 Core logging function
export const createActivityLog = async (req, action, module, recordId, description, oldValues = null, newValues = null) => {
  try {
    if (!req.user) return console.warn("User not attached to request");

    const log = new ActivityLog({
      user: {
        userId: req.user._id,
        userName: req.user.userName,
        userEmail: req.user.userEmail,
        userRole: req.user.userRole,
      },
      action,
      module,
      recordId,
      description,
      changes: { oldValues, newValues },
      request: {
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        method: req.method,
        url: req.originalUrl,
      },
    });

    await log.save();
  } catch (error) {
    console.error("Error saving activity log:", error.message);
  }
};

// 🔹 Automatic middleware (detects CRUD)
export const logActivity = (module) => {
  return (req, res, next) => {
    const oldJson = res.json.bind(res);

    res.json = async (data) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const method = req.method;
        let action, description;
        const recordId = req.params.id || data?.data?._id || data?._id;

        switch (method) {
          case "POST":
            action = "CREATE";
            description = `Created new ${module}`;
            break;
          case "PUT":
          case "PATCH":
            action = "UPDATE";
            description = `Updated ${module}`;
            break;
          case "DELETE":
            action = "DELETE";
            description = `Deleted ${module}`;
            break;
          default:
            break;
        }

        await createActivityLog(
          req,
          action,
          module,
          recordId,
          description,
          req.oldData || null,
          data?.data || data
        );
      }

      return oldJson(data);
    };

    next();
  };
};
