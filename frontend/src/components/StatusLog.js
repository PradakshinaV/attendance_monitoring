import React from "react";

function StatusLog({ logs, currentStatus }) {
  return (
    <div className="log-container">
      <h2>📌 Current Status: {currentStatus}</h2>
      <h3>📖 Log History</h3>
      {logs.length === 0 ? (
        <p>No activity logged yet.</p>
      ) : (
        <ul>
          {logs.map((entry, index) => (
            <li key={index}>
              {entry.status === "Left" ? "❌ Left" : "✅ Returned"} at{" "}
              {entry.time}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default StatusLog;
