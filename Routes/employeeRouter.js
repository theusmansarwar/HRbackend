const express=require("express");
const {createEmployee, getEmployeeList, updateEmployee, deleteEmployee, getArchivedEmployees} = require('../Controllers/employeeController');
const router = express.Router();
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/createEmployee", upload.single("profileImage"), createEmployee);
router.get('/getEmployees', getEmployeeList);
router.put("/updateEmployee/:id", upload.single("profileImage"), updateEmployee);
router.delete('/deleteEmployee/:id', deleteEmployee);
router.get('/getArchivedEmployees', getArchivedEmployees);

module.exports = router;














