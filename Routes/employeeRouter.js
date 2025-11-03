import express from "express";
import multer from "multer";
import { protect } from "../Middlewares/authMiddleware.js";
import {
  createEmployee,
  getEmployeeList,
  updateEmployee,
  deleteEmployee,
  getArchivedEmployees,
} from "../Controllers/employeeController.js";

const router = express.Router();

// Multer setup for profile image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Routes with protection and upload
router.post("/createEmployee", protect, upload.single("profileImage"), createEmployee);
router.put("/updateEmployee/:id", protect, upload.single("profileImage"), updateEmployee);
router.delete("/deleteEmployee/:id", protect, deleteEmployee);
router.get("/getEmployees", protect, getEmployeeList);
router.get("/getArchivedEmployees", protect, getArchivedEmployees);

export default router;
