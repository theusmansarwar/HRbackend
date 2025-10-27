import express from "express";
import multer from "multer";
import {  
  createEmployee,
  getEmployeeList,
  updateEmployee,
  deleteEmployee,
  getArchivedEmployees
} from "../Controllers/employeeController.js";
const router = express.Router();


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

export default router;














