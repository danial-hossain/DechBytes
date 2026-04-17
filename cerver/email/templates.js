// backend/email/templates.js

// Report Acknowledgment Template
export const getReportAcknowledgmentTemplate = (userName, reportId) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e3a8a; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0; }
          .footer { text-align: center; padding: 15px; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 10px 20px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; }
          .report-id { background: #e0e7ff; padding: 8px 15px; border-radius: 8px; display: inline-block; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>📋 TechBytes Support</h2>
          </div>
          <div class="content">
            <h3>Dear ${userName || "Valued Customer"},</h3>
            <p>Thank you for submitting your report. We have received your feedback and will review it shortly.</p>
            <p><strong>Report ID:</strong> <span class="report-id">#${reportId}</span></p>
            <p>Our team will review your report and get back to you within 24-48 hours.</p>
            <p>If you have any urgent concerns, please reply to this email.</p>
            <p>Best regards,<br><strong>TechBytes Support Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; 2024 TechBytes. All rights reserved.</p>
            <p>This is an automated message, please do not reply directly to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };
  
  // Help Acknowledgment Template
  export const getHelpAcknowledgmentTemplate = (email, helpId) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e3a8a; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0; }
          .footer { text-align: center; padding: 15px; font-size: 12px; color: #666; }
          .help-id { background: #e0e7ff; padding: 8px 15px; border-radius: 8px; display: inline-block; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🆘 TechBytes Support</h2>
          </div>
          <div class="content">
            <h3>Hello,</h3>
            <p>Thank you for contacting TechBytes Support. We have received your help request.</p>
            <p><strong>Request ID:</strong> <span class="help-id">#${helpId}</span></p>
            <p>Our support team will review your query and respond as soon as possible.</p>
            <p>We appreciate your patience!</p>
            <p>Best regards,<br><strong>TechBytes Support Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; 2024 TechBytes. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };
  
  // Admin Reply Template
  export const getAdminReplyTemplate = (userName, subject, replyMessage, type = 'report') => {
    const typeTitle = type === 'report' ? 'Report Response' : 'Help Request Response';
    const typeColor = type === 'report' ? '#3b82f6' : '#10b981';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${typeColor}; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0; }
          .reply-box { background: #e0e7ff; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid ${typeColor}; }
          .footer { text-align: center; padding: 15px; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 10px 20px; background: ${typeColor}; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>📧 TechBytes Support</h2>
            <p>${typeTitle}</p>
          </div>
          <div class="content">
            <h3>Dear ${userName || "Valued Customer"},</h3>
            <p>Thank you for reaching out to us. Here's our response to your query:</p>
            
            <div class="reply-box">
              <p><strong>Subject:</strong> ${subject}</p>
              <p><strong>Our Response:</strong></p>
              <p>${replyMessage}</p>
            </div>
            
            <p>If you need further assistance, please don't hesitate to reply to this email or submit another request.</p>
            <p>Best regards,<br><strong>TechBytes Support Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; 2024 TechBytes. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };