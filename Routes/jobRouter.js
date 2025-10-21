const express = require("express");
const {
  createJob,
  getJobList,
  getArchivedJobs,
  updateJob,
  deleteJob,
} = require("../Controllers/jobController");

const router = express.Router();

router.post("/createJob", createJob);
router.get("/getJobs", getJobList);
router.get("/getArchivedJobs", getArchivedJobs);
router.put("/updateJob/:id", updateJob);
router.delete("/deleteJob/:id", deleteJob);

module.exports = router;
