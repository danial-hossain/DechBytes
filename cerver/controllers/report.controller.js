// backend/controllers/report.controller.js
import { createReport, findAllReportsWithUser } from "../utils/report.db.js";
import { findUserById } from "../utils/user.db.js";
import { sql, connectMssqlDB } from '../config/db.js';
import sendEmailFun from '../config/sendEmail.js';
import { getReportAcknowledgmentTemplate, getAdminReplyTemplate } from '../email/templates.js';

export const createReportController = async (req, res) => {
  try {
    const { opinion } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: "User not authenticated" 
      });
    }

    if (!opinion || opinion.trim() === "") {
      return res.status(400).json({ 
        success: false,
        message: "Opinion is required" 
      });
    }

    // Get user details for email
    const user = await findUserById(userId);
    
    const newReport = await createReport({ userId, opinion });

    // Send acknowledgment email
    if (user && user.email) {
      try {
        const emailTemplate = getReportAcknowledgmentTemplate(user.name || "User", newReport.id);
        await sendEmailFun({
          to: user.email,
          subject: "We've received your report - TechBytes",
          html: emailTemplate,
        });
        console.log('✅ Acknowledgment email sent to:', user.email);
      } catch (emailError) {
        console.error('❌ Failed to send email:', emailError.message);
      }
    }

    res.status(201).json({
      success: true,
      message: "Report submitted successfully. A confirmation email has been sent.",
      report: newReport
    });
  } catch (error) {
    console.error("❌ Report creation error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// Admin reply to report
export const replyToReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { replyMessage, userEmail, userName } = req.body;

    if (!replyMessage) {
      return res.status(400).json({
        success: false,
        message: "Reply message is required"
      });
    }

    // Send email to user
    try {
      const emailTemplate = getAdminReplyTemplate(
        userName || "User",
        "Report Response",
        replyMessage,
        'report'
      );
      await sendEmailFun({
        to: userEmail,
        subject: "Response to your report - TechBytes",
        html: emailTemplate,
      });
      console.log('✅ Reply email sent to:', userEmail);
    } catch (emailError) {
      console.error('❌ Failed to send reply email:', emailError.message);
      return res.status(500).json({
        success: false,
        message: "Failed to send email reply"
      });
    }

    // Update report status
    const pool = await connectMssqlDB();
    await pool.request()
      .input('id', sql.Int, id)
      .input('status', sql.NVarChar(20), 'reviewed')
      .input('admin_reply', sql.NVarChar(sql.MAX), replyMessage)
      .input('replied_at', sql.DateTime2, new Date())
      .query(`
        UPDATE Reports 
        SET status = @status, 
            admin_reply = @admin_reply, 
            replied_at = @replied_at
        WHERE id = @id
      `);

    res.status(200).json({
      success: true,
      message: "Reply sent successfully"
    });
  } catch (error) {
    console.error("Error replying to report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send reply"
    });
  }
};

export const getReportsController = async (req, res) => {
  try {
    const userRole = req.userRole;

    if (userRole !== 'ADMIN') {
      return res.status(403).json({ 
        success: false,
        message: "Access denied. Admin only." 
      });
    }

    const reports = await findAllReportsWithUser();

    res.status(200).json({
      success: true,
      count: reports.length,
      reports: reports
    });
  } catch (error) {
    console.error("❌ Error fetching reports:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};