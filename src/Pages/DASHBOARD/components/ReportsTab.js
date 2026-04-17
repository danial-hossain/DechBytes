// DASHBOARD/components/ReportsTab.js
import React, { useState } from "react";

const ReportsTab = ({ reports = [], onRefresh }) => {
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleReply = async (report) => {
    if (!replyMessage.trim()) {
      setMessage({ text: "Please enter a reply message", type: "error" });
      return;
    }

    setSending(true);
    try {
      const res = await fetch(`http://localhost:5001/api/admin/reports/${report.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          replyMessage: replyMessage,
          userEmail: report.user?.email,
          userName: report.user?.name
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ text: "✅ Reply sent successfully!", type: "success" });
        setReplyingTo(null);
        setReplyMessage("");
        if (onRefresh) onRefresh();
      } else {
        setMessage({ text: data.message || "Failed to send reply", type: "error" });
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      setMessage({ text: "Server error", type: "error" });
    } finally {
      setSending(false);
    }
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  return (
    <div className="table-container">
      <h2>📊 User Reports</h2>

      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      {reports.length === 0 ? (
        <p className="no-data">No reports found.</p>
      ) : (
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Opinion</th>
                <th>Created At</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td>{report.user?.name || "Unknown"}</td>
                  <td>{report.user?.email || "Unknown"}</td>
                  <td>{report.opinion}</td>
                  <td>{report.createdAt}</td>
                  <td>
                    <span className={`status-badge ${report.status === 'reviewed' ? 'completed' : 'pending'}`}>
                      {report.status || "Pending"}
                    </span>
                  </td>
                  <td>
                    {replyingTo === report.id ? (
                      <div className="reply-form">
                        <textarea
                          placeholder="Type your reply..."
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          rows="3"
                        />
                        <div className="reply-actions">
                          <button onClick={() => handleReply(report)} disabled={sending}>
                            {sending ? "Sending..." : "Send Reply"}
                          </button>
                          <button onClick={() => setReplyingTo(null)}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        className="reply-btn"
                        onClick={() => setReplyingTo(report.id)}
                      >
                        ✉️ Reply
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReportsTab;