// backend/routes/admin.route.js
import { Router } from "express";
import auth from "../middlewares/auth.js";
import { findUserById, findUsers } from "../utils/user.db.js";
import { sql, connectMssqlDB } from "../config/db.js";
import sendEmailFun from "../config/sendEmail.js";
import { getAdminReplyTemplate } from "../email/templates.js";

const router = Router();

// ==================== EXISTING ROUTE ====================

/**
 * @route   GET /api/admin/users
 * @desc    Get all users (admin only)
 */
router.get("/users", auth, async (req, res) => {
  try {
    const currentUser = await findUserById(req.userId);

    if (!currentUser || currentUser.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    // fetch users without sending password hash
    const users = await findUsers(["name", "email", "role", "status", "created_at"]);

    res.json({ success: true, users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==================== NEW REPLY ROUTES ====================

/**
 * @route   POST /api/admin/reports/:id/reply
 * @desc    Admin reply to a report
 */
router.post("/reports/:id/reply", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { replyMessage, userEmail, userName } = req.body;

    // Check if user is admin
    const currentUser = await findUserById(req.userId);
    if (!currentUser || currentUser.role !== "ADMIN") {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Admin only." 
      });
    }

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
        subject: "Response to your report - TechBytes Support",
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

    // Update report status in database
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
      message: "Failed to send reply",
      error: error.message
    });
  }
});

/**
 * @route   POST /api/admin/helps/:id/reply
 * @desc    Admin reply to a help request
 */
router.post("/helps/:id/reply", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { replyMessage, userEmail, userName } = req.body;

    // Check if user is admin
    const currentUser = await findUserById(req.userId);
    if (!currentUser || currentUser.role !== "ADMIN") {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Admin only." 
      });
    }

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
        "Help Request Response",
        replyMessage,
        'help'
      );
      await sendEmailFun({
        to: userEmail,
        subject: "Response to your help request - TechBytes Support",
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

    // Update help status in database
    const pool = await connectMssqlDB();
    await pool.request()
      .input('id', sql.Int, id)
      .input('status', sql.NVarChar(20), 'resolved')
      .input('admin_reply', sql.NVarChar(sql.MAX), replyMessage)
      .input('replied_at', sql.DateTime2, new Date())
      .query(`
        UPDATE Helps 
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
    console.error("Error replying to help:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send reply",
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/reports
 * @desc    Get all reports (admin only)
 */
router.get("/reports", auth, async (req, res) => {
  try {
    const currentUser = await findUserById(req.userId);
    if (!currentUser || currentUser.role !== "ADMIN") {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Admin only." 
      });
    }

    const pool = await connectMssqlDB();
    const result = await pool.request().query(`
      SELECT 
        r.id,
        r.opinion,
        r.created_at,
        r.status,
        r.admin_reply,
        r.replied_at,
        u.name as userName,
        u.email as userEmail
      FROM Reports r
      LEFT JOIN Users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
    `);

    res.status(200).json({
      success: true,
      reports: result.recordset
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reports"
    });
  }
});

/**
 * @route   GET /api/admin/helps
 * @desc    Get all help requests (admin only)
 */
router.get("/helps", auth, async (req, res) => {
  try {
    const currentUser = await findUserById(req.userId);
    if (!currentUser || currentUser.role !== "ADMIN") {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Admin only." 
      });
    }

    const pool = await connectMssqlDB();
    const result = await pool.request().query(`
      SELECT 
        id,
        email,
        message,
        created_at,
        status,
        admin_reply,
        replied_at
      FROM Helps
      ORDER BY created_at DESC
    `);

    res.status(200).json({
      success: true,
      helps: result.recordset
    });
  } catch (error) {
    console.error("Error fetching helps:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch help requests"
    });
  }
});

export default router;