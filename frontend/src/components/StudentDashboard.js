import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LocationTracker from "./LocationTracker";
import StatusLog from "./StatusLog";

const StudentDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [currentStatus, setCurrentStatus] = useState("Loading...");
  const [boundaryStats, setBoundaryStats] = useState({
    totalTimeOutside: 0,
    numberOfExits: 0,
    longestAbsence: 0,
    alertsTriggered: 0
  });

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const updateLogs = (newLogEntry, status) => {
    setLogs((prevLogs) => {
      const updatedLogs = [...prevLogs, newLogEntry];

      // Update boundary statistics
      setBoundaryStats((prevStats) => {
        const newStats = { ...prevStats };

        if (status === "just_left") {
          newStats.numberOfExits += 1;
        }

        if (newLogEntry.alert) {
          newStats.alertsTriggered += 1;
        }

        if (newLogEntry.outsideDuration > newStats.longestAbsence) {
          newStats.longestAbsence = newLogEntry.outsideDuration;
        }

        if (!newLogEntry.isWithinBoundary && newLogEntry.outsideDuration) {
          newStats.totalTimeOutside = Math.max(
            newStats.totalTimeOutside,
            newLogEntry.outsideDuration
          );
        }

        return newStats;
      });

      return updatedLogs;
    });

    setCurrentStatus(status);
  };

  const getStatusDisplay = () => {
    let color = "#4CAF50";
    let icon = "✅";

    switch (currentStatus) {
      case "just_left":
        color = "#FF9800";
        icon = "⚠️";
        break;
      case "outside":
        color = "#FF5722";
        icon = "🚨";
        break;
      case "long_absence":
        color = "#F44336";
        icon = "🚨";
        break;
      case "inside":
        color = "#4CAF50";
        icon = "✅";
        break;
      default:
        color = "#757575";
        icon = "📍";
    }

    return (
      <span style={{ color: color, fontWeight: "bold" }}>
        {icon} {currentStatus}
      </span>
    );
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ borderBottom: "2px solid #4CAF50", paddingBottom: "10px" }}>
        Student Dashboard
      </h2>

      {/* Current Status */}
      <div
        style={{
          backgroundColor: "#f5f5f5",
          padding: "15px",
          borderRadius: "8px",
          margin: "15px 0",
          border: "1px solid #ddd"
        }}
      >
        <p style={{ fontSize: "18px", margin: "0" }}>
          <strong>Current Status:</strong> {getStatusDisplay()}
        </p>
      </div>

      {/* Location Tracker */}
      <LocationTracker updateLogs={updateLogs} locationPermission={true} />

      {/* Session Statistics */}
      <div
        style={{
          backgroundColor: "#e8f5e8",
          padding: "15px",
          borderRadius: "8px",
          margin: "15px 0",
          border: "1px solid #4CAF50"
        }}
      >
        <h3 style={{ margin: "0 0 10px 0", color: "#2E7D32" }}>
          📊 Session Statistics
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "10px"
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#1976D2"
              }}
            >
              {boundaryStats.numberOfExits}
            </div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              Times Left Class
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#F57C00"
              }}
            >
              {boundaryStats.totalTimeOutside.toFixed(1)}m
            </div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              Total Time Outside
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#8E24AA"
              }}
            >
              {boundaryStats.longestAbsence.toFixed(1)}m
            </div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              Longest Absence
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#D32F2F"
              }}
            >
              {boundaryStats.alertsTriggered}
            </div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              Alerts Triggered
            </div>
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div
        style={{
          backgroundColor: "#fff3cd",
          border: "1px solid #ffeaa7",
          borderRadius: "8px",
          padding: "15px",
          margin: "15px 0"
        }}
      >
        <h4 style={{ margin: "0 0 8px 0", color: "#856404" }}>
          📋 Important Notice
        </h4>
        <ul
          style={{
            margin: "0",
            paddingLeft: "20px",
            fontSize: "14px",
            color: "#856404"
          }}
        >
          <li>
            Your location is tracked within a 50-meter radius of the classroom
          </li>
          <li>
            If you leave the classroom area for more than 5 minutes, staff will
            be automatically notified
          </li>
          <li>Always inform your teacher before leaving the classroom</li>
          <li>
            Location tracking helps ensure student safety and attendance
            accuracy
          </li>
        </ul>
      </div>

      {/* Status Log */}
      <StatusLog logs={logs} currentStatus={currentStatus} />
    </div>
  );
};

export default StudentDashboard;

