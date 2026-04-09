import React, { useState } from "react";
import "./style.css";

const ReportPage = () => {
  const [opinion, setOpinion] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!opinion.trim()) return;

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.accessToken;

      if (!token) {
        setMessage("You must be logged in to submit a report");
        setIsError(true);
        return;
      }

      const res = await fetch("http://localhost:5001/api/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ opinion }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setIsError(false);
        setOpinion("");
      } else {
        setMessage(data.error || data.message || "Something went wrong");
        setIsError(true);
      }
    } catch (err) {
      console.error(err);
      setMessage("Failed to connect to server");
      setIsError(true);
    }
  };

  return (
    <div className="report-container">
      <h2>Give Your Opinion</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={opinion}
          onChange={(e) => setOpinion(e.target.value)}
          placeholder="Write your opinion..."
          required
        />
        <button type="submit" disabled={!opinion.trim()}>
          Submit
        </button>
      </form>

      {message && (
        <p className={`message ${isError ? "error" : "success"}`}>{message}</p>
      )}
    </div>
  );
};

export default ReportPage;