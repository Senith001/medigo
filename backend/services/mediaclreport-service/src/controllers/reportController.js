import mongoose from "mongoose";
import Report from "../models/Report.js";

// @desc    Create report
// @route   POST /api/reports
export const createReport = async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      appointmentId,
      reportTitle,
      reportType,
      description,
      uploadedBy,
      status,
      uploadDate
    } = req.body;

    if (!patientId || !doctorId || !reportTitle || !reportType) {
      return res.status(400).json({
        success: false,
        message: "patientId, doctorId, reportTitle, and reportType are required"
      });
    }

    const fileUrl = req.file ? `/uploads/${req.file.filename}` : "";

    const report = await Report.create({
      patientId,
      doctorId,
      appointmentId,
      reportTitle,
      reportType,
      description,
      fileUrl,
      uploadedBy,
      status,
      uploadDate
    });

    res.status(201).json({
      success: true,
      message: "Report created successfully",
      data: report
    });
  } catch (error) {
    console.error("Create report error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create report",
      error: error.message
    });
  }
};

// @desc    Get all reports
// @route   GET /api/reports
export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    console.error("Get all reports error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch reports",
      error: error.message
    });
  }
};

// @desc    Get report by ID
// @route   GET /api/reports/:id
export const getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report ID"
      });
    }

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found"
      });
    }

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error("Get report by ID error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch report",
      error: error.message
    });
  }
};

// @desc    Get reports by patient ID
// @route   GET /api/reports/patient/:patientId
export const getReportsByPatientId = async (req, res) => {
  try {
    const reports = await Report.find({
      patientId: req.params.patientId
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    console.error("Get reports by patient error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch patient reports",
      error: error.message
    });
  }
};

// @desc    Get reports by doctor ID
// @route   GET /api/reports/doctor/:doctorId
export const getReportsByDoctorId = async (req, res) => {
  try {
    const reports = await Report.find({
      doctorId: req.params.doctorId
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    console.error("Get reports by doctor error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch doctor reports",
      error: error.message
    });
  }
};

// @desc    Update report by ID
// @route   PUT /api/reports/:id
export const updateReport = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report ID"
      });
    }

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found"
      });
    }

    const updatedReport = await Report.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Report updated successfully",
      data: updatedReport
    });
  } catch (error) {
    console.error("Update report error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update report",
      error: error.message
    });
  }
};

// @desc    Delete report by ID
// @route   DELETE /api/reports/:id
export const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report ID"
      });
    }

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found"
      });
    }

    await Report.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Report deleted successfully"
    });
  } catch (error) {
    console.error("Delete report error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete report",
      error: error.message
    });
  }
};