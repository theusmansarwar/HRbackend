// backend/controllers/archiveController.js
import mongoose from "mongoose";

import {ArchiveService} from "../utils/archiveService.js"
const archiveService = new ArchiveService();

export const getAllArchives = async (req, res) => {
  try {
    const result = await archiveService.getAllArchivedData();
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const restoreAllArchives = async (req, res) => {
  try {
    const result = await archiveService.restoreAllArchived();
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const restoreById = async (req, res) => {
  try {
    const { modelName, id } = req.params;
    
    const result = await archiveService.restoreById(modelName, id);
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// export const restoreTable = async (req, res) => {
//   try {
//     const { tableName } = req.params;
    
//     // Get the model dynamically
//     const Model = mongoose.model(tableName);
    
//     // Restore all archived records in this table
//     const result = await Model.updateMany(
//       { archive: true },
//       { $set: { archive: false } }
//     );
    
//     res.json({
//       message: `Successfully restored ${result.modifiedCount} records from ${tableName}`,
//       count: result.modifiedCount
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to restore table', error: error.message });
//   }
// }

export const restoreTable = async (req, res) => {
  try {
    const { tableName } = req.params;

     
    const Model = mongoose.model(tableName);

     
    const result = await Model.updateMany(
      { isArchived: true },          
      { $set: { isArchived: false } } 
    );

    res.json({
      message: `Successfully restored ${result.modifiedCount} records from ${tableName}`,
      count: result.modifiedCount,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to restore table", error: error.message });
  }
};


 export const getArchivesByModel = async (req, res) => {
  try {
    const { modelName } = req.params;
    
    const result = await archiveService.getArchivedByModel(modelName);
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getArchiveStats = async (req, res) => {
  try {
    const result = await archiveService.getArchiveStats();
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

 