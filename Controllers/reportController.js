import Report from "../Models/reports.js";

export const createReport = async (req, res) => {
  try {
    const report = new Report(req.body);
    await report.save();
    res.status(201).json({ message: "Report saved successfully", report });
  } catch (error) {
    res.status(500).json({ message: "Error creating report", error: error.message });
  }
};

export const getReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reports", error: error.message });
  }
};

export const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: "Error fetching report", error: error.message });
  }
};

export const updateReport = async (req, res) => {
  try {
    const updated = await Report.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } 
    );
    if (!updated) return res.status(404).json({ message: "Report not found" });
    res.status(200).json({ message: "Report updated successfully", report: updated });
  } catch (error) {
    res.status(500).json({ message: "Error updating report", error: error.message });
  }
};

export const deleteReport = async (req, res) => {
  try {
    const deleted = await Report.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Report not found" });
    res.status(200).json({ message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting report", error: error.message });
  }
};
