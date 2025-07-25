import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import Login from "./components/Login";
import LocationTracker from "./components/LocationTracker";
import StatusLog from "./components/StatusLog";
import CreateClass from "./components/CreateClass";
import AddStudent from "./components/AddStudent";
import StudentList from "./components/StudentList";
import StudentAttendance from "./components/StudentAttendance";
import LocationToggle from "./components/LocationToggle";
import AdminDashboard from "./components/AdminDashboard";
import TeacherDashboard from "./components/TeacherDashboard";
import SendLocation from "./components/SendLocation"; // ✅ Your button

import "./styles.css";

function App() {
  const [logs, setLogs] = useState([]);
  const [currentStatus, setCurrentStatus] = useState("Loading...");
  const [locationPermission, setLocationPermission] = useState(true);
  const [students, setStudents] = useState([
    { name: "Alice", id: "S101", status: "Present" },
    { name: "Bob", id: "S102", status: "Absent" },
  ]);

  const updateLogs = (newLogEntry, status) => {
    setLogs((prevLogs) => [...prevLogs, newLogEntry]);
    setCurrentStatus(status);
  };

  return (
    <Router>
      <div className="container">
        <h1>Attendance Monitoring System</h1>

        {/* Navigation */}
        <nav style={{ marginBottom: "20px" }}>
          <Link to="/" style={{ marginRight: "15px" }}>🏫 Home</Link>
          <Link to="/teacher" style={{ marginRight: "15px" }}>👨‍🏫 Teacher</Link>
          <Link to="/admin" style={{ marginRight: "15px" }}>🛠️ Admin</Link>
          <Link to="/student">🎓 Student</Link>
        </nav>

        <Routes>
          <Route path="/" element={<TeacherDashboard />} />

        <Route path="/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <section className="dashboard-section">
                <h2>Admin Dashboard</h2>
                <AdminDashboard students={students} setStudents={setStudents} />
              </section>
            }
          />

          <Route
            path="/teacher"
            element={
              <section className="dashboard-section">
                <h2>Teacher Dashboard</h2>
                <CreateClass />
                <AddStudent students={students} setStudents={setStudents} />
                <StudentList students={students} />
              </section>
            }
          />

          <Route
            path="/student"
            element={
              <section className="dashboard-section">
                <h2>Student Dashboard</h2>
                <LocationToggle onPermissionChange={setLocationPermission} />
                <LocationTracker
                  updateLogs={updateLogs}
                  locationPermission={locationPermission}
                />
                <SendLocation /> {/* ✅ Button to send location */}
                <p>
                  Current Status:{" "}
                  <span className="status">{currentStatus}</span>
                </p>
                <StatusLog logs={logs} currentStatus={currentStatus} />
                <StudentAttendance logs={logs} />
              </section>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
