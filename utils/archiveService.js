// backend/services/archiveService.js
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

export class ArchiveService {
  // Get all models that have isArchived field
  getArchivableModels() {
    const models = mongoose.modelNames();
    const archivableModels = [];

    models.forEach(modelName => {
      const model = mongoose.model(modelName);
      const schemaObj = model.schema.obj;

      // Check if model has isArchived field
      if (schemaObj.isArchived !== undefined) {
        archivableModels.push({
          name: modelName,
          model,
          collection: model.collection.collectionName,
        });
      }
    });

    return archivableModels;
  }

  // Get all archived data from all tables
  async getAllArchivedData() {
    try {
      const archivableModels = this.getArchivableModels();
      const archivedData = {};

      for (const modelInfo of archivableModels) {
        const Model = modelInfo.model;
        const archived = await Model.find({ isArchived: true })
          .lean()
          .sort({ createdAt: -1 });

        if (archived.length > 0) {
          archivedData[modelInfo.name] = {
            collection: modelInfo.collection,
            count: archived.length,
            data: archived,
          };
        }
      }

      return {
        success: true,
        totalTables: Object.keys(archivedData).length,
        totalRecords: Object.values(archivedData).reduce(
          (sum, table) => sum + table.count,
          0
        ),
        archives: archivedData,
      };
    } catch (error) {
      throw new Error(`Error fetching archived data: ${error.message}`);
    }
  }

  // ✅ Create a full backup of all data before resetting isArchived
  async createBackup() {
    try {
      const models = this.getArchivableModels();
      const backup = {};

      for (const modelInfo of models) {
        const Model = modelInfo.model;
        const data = await Model.find().lean();
        backup[modelInfo.name] = data;
      }

      const backupPath = path.join(
        "backups",
        `backup_${new Date().toISOString().replace(/[:.]/g, "-")}.json`
      );

      fs.mkdirSync("backups", { recursive: true });
      fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));

      return { success: true, message: `Backup created at ${backupPath}` };
    } catch (error) {
      throw new Error(`Error creating backup: ${error.message}`);
    }
  }

  // Restore all archived records (set isArchived: false)
  async restoreAllArchived() {
    try {
      const archivableModels = this.getArchivableModels();
      const restoredData = {};
      let totalRestored = 0;

      for (const modelInfo of archivableModels) {
        const Model = modelInfo.model;

        const result = await Model.updateMany(
          { isArchived: true },
          { $set: { isArchived: false } }
        );

        if (result.modifiedCount > 0) {
          restoredData[modelInfo.name] = {
            collection: modelInfo.collection,
            restored: result.modifiedCount,
          };
          totalRestored += result.modifiedCount;
        }
      }

      return {
        success: true,
        message: `Restored ${totalRestored} records from ${Object.keys(restoredData).length} tables.`,
        totalRestored,
        details: restoredData,
      };
    } catch (error) {
      throw new Error(`Error restoring archived data: ${error.message}`);
    }
  }

  // Restore by ID
  async restoreById(modelName, recordId) {
    try {
      const Model = mongoose.model(modelName);
      const restored = await Model.findByIdAndUpdate(
        recordId,
        { $set: { isArchived: false } },
        { new: true }
      );

      if (!restored) throw new Error("Record not found");

      return {
        success: true,
        message: `Record restored from ${modelName}`,
        data: restored,
      };
    } catch (error) {
      throw new Error(`Error restoring record: ${error.message}`);
    }
  }

  // Get archived by model
  async getArchivedByModel(modelName) {
    try {
      const Model = mongoose.model(modelName);
      const archived = await Model.find({ isArchived: true })
        .lean()
        .sort({ createdAt: -1 });

      return {
        success: true,
        model: modelName,
        count: archived.length,
        data: archived,
      };
    } catch (error) {
      throw new Error(`Error fetching archived data from ${modelName}: ${error.message}`);
    }
  }

  // Get stats
  async getArchiveStats() {
    try {
      const archivableModels = this.getArchivableModels();
      const stats = [];

      for (const modelInfo of archivableModels) {
        const Model = modelInfo.model;
        const archivedCount = await Model.countDocuments({ isArchived: true });
        const activeCount = await Model.countDocuments({ isArchived: false });

        stats.push({
          model: modelInfo.name,
          collection: modelInfo.collection,
          archived: archivedCount,
          active: activeCount,
          total: archivedCount + activeCount,
        });
      }

      return { success: true, stats };
    } catch (error) {
      throw new Error(`Error fetching archive stats: ${error.message}`);
    }
  }
}
