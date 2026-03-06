// controllers/report.controller.js
import { createReport, findAllReportsWithUser } from "../utils/report.db.js";

/**
 * Create a new report (for authenticated users)
 */
export const createReportController = async (req, res) => {
  try {
    const { opinion } = req.body;
    const userId = req.userId;

    console.log('Creating report - User ID:', userId);
    console.log('Opinion:', opinion);

    // Check if user is authenticated
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: "User not authenticated" 
      });
    }

    // Validate opinion
    if (!opinion || opinion.trim() === "") {
      return res.status(400).json({ 
        success: false,
        message: "Opinion is required" 
      });
    }

    // Create report in database
    const newReport = await createReport({ userId, opinion });

    console.log('Report created successfully:', newReport);

    return res.status(201).json({
      success: true,
      message: "Report submitted successfully",
      report: newReport
    });

  } catch (error) {
    console.error("❌ Report creation error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

/**
 * Get all reports with user information (for admin)
 */
export const getReportsController = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;

    console.log('Fetching reports - User ID:', userId, 'Role:', userRole);

    // Check if user is admin
    if (userRole !== 'ADMIN') {
      return res.status(403).json({ 
        success: false,
        message: "Access denied. Admin only." 
      });
    }

    // Fetch all reports with user details
    const reports = await findAllReportsWithUser();

    console.log(`Found ${reports.length} reports`);

    return res.status(200).json({
      success: true,
      count: reports.length,
      reports: reports
    });

  } catch (error) {
    console.error("❌ Error fetching reports:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

/**
 * Get reports for the current user (optional)
 */
export const getUserReportsController = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: "User not authenticated" 
      });
    }

    // You'll need to implement this function in report.db.js if needed
    const userReports = await getUserReports(userId);

    return res.status(200).json({
      success: true,
      count: userReports.length,
      reports: userReports
    });

  } catch (error) {
    console.error("❌ Error fetching user reports:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};