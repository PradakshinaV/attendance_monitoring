import React from "react";

function StudentAttendance({ logs }) {
  return (
    <div className="attendance-history">
      <h3>Your Attendance History</h3>
      {logs.length === 0 ? (
        <p>No attendance logs yet.</p>
      ) : (
        <ul>
          {logs.map((log, index) => (
            <li key={index}>
              {log.status === "Left" ? "❌ Left" : "✅ Returned"} at {log.time}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default StudentAttendance;
