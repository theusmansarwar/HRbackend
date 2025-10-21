const express = require("express");
const {
createApplication,
getApplicationList,
updateApplication,
deleteApplication,
getArchivedApplications,
} = require("../Controllers/applicationController");

const router = express.Router();

router.post("/createApplication", createApplication);
router.get("/getApplications", getApplicationList);
router.put("/updateApplication/:id", updateApplication);
router.delete("/deleteApplication/:id", deleteApplication);
router.get("/getArchivedApplications", getArchivedApplications);

module.exports = router;