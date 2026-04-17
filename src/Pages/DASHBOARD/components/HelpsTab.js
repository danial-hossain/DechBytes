// DASHBOARD/components/HelpsTab.js
import React, { useState } from "react";

const HelpsTab = ({ helps = [], onRefresh }) => {
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleReply = async (help) => {
    if (!replyMessage.trim()) {
      setMessage({ text: "Please enter a reply message", type: "error" });
      return;
    }

    setSending(true);
    try {
      const res = await fetch(`http://localhost:5001/api/admin/helps/${help.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          replyMessage: replyMessage,
          userEmail: help.email,
          userName: help.email.split('@')[0]
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

  // ✅ ফরম্যাট তারিখ ফাংশন
  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleString();
    } catch (e) {
      return "N/A";
    }
  };

  return (
    <div className="table-container">
      <h2>🆘 Help Requests</h2>

      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      {helps.length === 0 ? (
        <p className="no-data">No help requests found.</p>
      ) : (
        <div className="table-responsive">
          <table className="helps-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Message</th>
                <th>Created At</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {helps.map((help) => (
                <tr key={help.id} className={help.status === 'resolved' ? 'resolved-row' : ''}>
                  <td>{help.email}</td>
                  <td className="message-cell">{help.message}</td>
                  {/* ✅ createdAt অথবা created_at দুইটাই চেক করুন */}
                  <td>{formatDate(help.createdAt || help.created_at)}</td>
                  <td>
                    <span className={`status-badge ${help.status === 'resolved' ? 'completed' : 'pending'}`}>
                      {help.status === 'resolved' ? '✓ Resolved' : '⏳ Pending'}
                    </span>
                  </td>
                  <td>
                    {replyingTo === help.id ? (
                      <div className="reply-form-inline">
                        <textarea
                          placeholder="Type your reply..."
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          rows="2"
                          className="reply-textarea"
                        />
                        <div className="reply-actions-inline">
                          <button onClick={() => handleReply(help)} disabled={sending} className="send-reply-btn">
                            {sending ? "⏳ Sending..." : "✉️ Send"}
                          </button>
                          <button onClick={() => setReplyingTo(null)} className="cancel-reply-btn">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        className={`reply-btn ${help.status === 'resolved' ? 'replied' : ''}`}
                        onClick={() => setReplyingTo(help.id)}
                        disabled={help.status === 'resolved'}
                      >
                        {help.status === 'resolved' ? '✓ Replied' : '✉️ Reply'}
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

export default HelpsTab;