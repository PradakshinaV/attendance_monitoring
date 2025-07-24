import React, { useState } from "react";
import LocationTracker from "./components/LocationTracker";
import StatusLog from "./components/StatusLog";
import CreateClass from "./components/CreateClass";
import AddStudent from "./components/AddStudent";
import StudentList from "./components/StudentList";

import StudentAttendance from "./components/StudentAttendance";
import LocationToggle from "./components/LocationToggle";
import AdminDashboard from "./components/AdminDashboard";
import "./styles.css";

function App() {
  const [logs, setLogs] = useState([]);
  const [currentStatus, setCurrentStatus] = useState("Loading...");
  const [students, setStudents] = useState([
    { name: "Alice", id: "S101", status: "Present" },
    { name: "Bob", id: "S102", status: "Absent" },
  ]);
   const [locationPermission, setLocationPermission] = useState(true);
  const updateLogs = (newLogEntry, status) => {
    setLogs((prevLogs) => [...prevLogs, newLogEntry]);
    setCurrentStatus(status);
  };

  return (
    <div className="container">
      <h1>Attendance Monitoring System</h1>
  <div className="App">
      <h1>Attendance System</h1>
      <AdminDashboard students={students} setStudents={setStudents} />
    </div>
      {/* 🧑‍🏫 Teacher Dashboard */}
      <div className="dashboard-section">
        <h2>Teacher Dashboard</h2>
        <CreateClass />
        <AddStudent />
        <StudentList />
      </div>

        {/* 🎓 Student Dashboard */}
      <div className="dashboard-section">
        <h2>Student Dashboard</h2>
        <LocationToggle onPermissionChange={setLocationPermission} />
        <LocationTracker
          updateLogs={updateLogs}
          locationPermission={locationPermission}
        />
        <p>
          Current Status: <span className="status">{currentStatus}</span>
        </p>
        <StatusLog logs={logs} currentStatus={currentStatus} />
        <StudentAttendance logs={logs} />
      </div>
    </div>
  );
}

export default App;
