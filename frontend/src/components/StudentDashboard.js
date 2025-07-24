import React, { useState } from "react";
import LocationTracker from "./LocationTracker";
import StatusLog from "./StatusLog";

const StudentDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [currentStatus, setCurrentStatus] = useState("Loading...");

  const updateLogs = (newLogEntry, status) => {
    setLogs((prevLogs) => [...prevLogs, newLogEntry]);
    setCurrentStatus(status);
  };

  return (
    <div>
      <h2>Student Dashboard</h2>
      <p>Current Status: <span className="status">{currentStatus}</span></p>
      <LocationTracker updateLogs={updateLogs} locationPermission={true} />

      <StatusLog logs={logs} currentStatus={currentStatus} />
    </div>
  );
};

export default StudentDashboard;
