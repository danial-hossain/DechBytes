// backend/controllers/help.controller.js
import { createHelp } from "../utils/help.db.js";
import { sql, connectMssqlDB } from '../config/db.js';
import sendEmailFun from '../config/sendEmail.js';
import { getHelpAcknowledgmentTemplate, getAdminReplyTemplate } from '../email/templates.js';

export const submitHelp = async (req, res) => {
  try {
    const { email, message } = req.body;

    if (!email || !message) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and message are required" 
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address"
      });
    }

    console.log('Creating help request for:', email);

    const newHelp = await createHelp({ email, message });

    // Send acknowledgment email
    try {
      const emailTemplate = getHelpAcknowledgmentTemplate(email, newHelp.id);
      await sendEmailFun({
        to: email,
        subject: "We've received your help request - TechBytes Support",
        html: emailTemplate,
      });
      console.log('✅ Acknowledgment email sent to:', email);
    } catch (emailError) {
      console.error('❌ Failed to send email:', emailError.message);
      // Continue - don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: "Help request submitted successfully. A confirmation email has been sent.",
      data: newHelp
    });
  } catch (error) {
    console.error("❌ Help submission error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error"
    });
  }
};

// Admin reply to help request
export const replyToHelp = async (req, res) => {
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
      message: "Failed to send reply"
    });
  }
};

export const getAllHelps = async (req, res) => {
  try {
    const pool = await connectMssqlDB();
    const result = await pool.request()
      .query('SELECT * FROM Helps ORDER BY created_at DESC');
    
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
};