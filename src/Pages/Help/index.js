import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./style.css";

const HelpCenter = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !message) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, message })
      });

      const data = await res.json();

      if (data.success) {
        alert("Your message has been sent! We’ll get back to you soon.");
        setEmail("");
        setMessage("");
      } else {
        alert(data.message || "Failed to send message");
      }
    } catch (error) {
      console.error(error);
      alert("Server error. Try again later.");
    }
    setLoading(false);
  };

  return (
    <main className="help-center container">
      <h2 className="help-title">Help Center</h2>
      <p className="help-subtitle">We’re here to help! Please send us your query.</p>

      <div className="chat-quick-action">
        <span>Need faster support?</span>
        <Link to="/messaging" className="chat-quick-link">
          Open Live Chat
        </Link>
      </div>

      <form className="help-form" onSubmit={handleSubmit}>
        <label>Email Address</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Message</label>
        <textarea
          placeholder="Write your message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows="6"
          required
        />

        <button type="submit" className="help-btn" disabled={loading}>
          {loading ? "Sending..." : "Send"}
        </button>
      </form>
    </main>
  );
};

export default HelpCenter;
