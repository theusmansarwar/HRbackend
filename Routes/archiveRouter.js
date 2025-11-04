// backend/routes/archiveRoutes.js

import express from "express";
const router = express.Router();
import {
  getAllArchives,
  restoreAllArchives,
  restoreById,
  getArchivesByModel,
  getArchiveStats,
  restoreTable
} from '../Controllers/archiveController.js';

import { protect } from "../Middlewares/authMiddleware.js";

router.use(protect); 
 

router.get('/all', getAllArchives);

router.get('/stats', getArchiveStats);

router.get('/model/:modelName', getArchivesByModel);

router.post('/restore-all', restoreAllArchives);

router.post('/restore/:modelName/:id', restoreById);

// Restore all records from a specific table
router.post('/restore-table/:tableName',restoreTable);

 export default router;