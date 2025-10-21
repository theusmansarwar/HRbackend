const express = require("express");
const {
  createDesignation,
  getDesignationList,
  getArchivedDesignations,
  updateDesignation,
  deleteDesignation,
} = require("../Controllers/designationController");

const router = express.Router();

router.post("/createDesignation", createDesignation);
router.get("/getDesignations", getDesignationList);
router.get("/getArchivedDesignations", getArchivedDesignations);
router.put("/updateDesignation/:id", updateDesignation);
router.delete("/deleteDesignation/:id", deleteDesignation);

module.exports = router;
