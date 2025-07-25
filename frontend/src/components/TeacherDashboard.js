// TeacherDashboard.js - With CRUD Table for Students
import React, { useEffect, useState } from "react";
import axios from "axios";
import CreateClass from "./CreateClass";
import AddStudent from "./AddStudent";

export default function TeacherDashboard() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({ username: "", email: "" });

  // Fetch all classes
  const fetchClasses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/class/all");
      setClasses(res.data);
    } catch (err) {
      console.error("Error fetching classes", err);
    }
  };

  // Fetch students for selected class
  const fetchStudentsForClass = async (classId) => {
    try {
      const selectedClassData = classes.find(cls => cls._id === classId);
      if (selectedClassData && selectedClassData.students) {
        setStudents(selectedClassData.students);
      }
    } catch (err) {
      console.error("Error fetching students", err);
    }
  };

  // Remove student from class only
  const removeStudentFromClass = async (studentId, classId) => {
    if (!window.confirm("Remove this student from the class? (Student account will remain)")) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/class/remove-student`, {
        data: { classId, studentId },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert("Student removed from class!");
      fetchClasses(); // Refresh data
      if (selectedClass) {
        fetchStudentsForClass(selectedClass);
      }
    } catch (err) {
      console.error("Failed to remove student from class", err);
      alert("Failed to remove student: " + (err.response?.data?.msg || err.message));
    }
  };

  // Delete student permanently
  const deleteStudentPermanently = async (studentId) => {
    if (!window.confirm("⚠️ PERMANENTLY DELETE this student account? This cannot be undone!")) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/user/delete/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert("Student account deleted permanently!");
      fetchClasses(); // Refresh data
      if (selectedClass) {
        fetchStudentsForClass(selectedClass);
      }
    } catch (err) {
      console.error("Failed to delete student", err);
      alert("Failed to delete student: " + (err.response?.data?.msg || err.message));
    }
  };

  // Delete entire class (NO AUTH VERSION)
  const deleteClass = async (classId, className) => {
    if (!window.confirm(`⚠️ DELETE the entire class "${className}"? This will remove all students from this class!`)) {
      return;
    }
    
    try {
      console.log("Deleting class:", classId); // Debug log
      
      // ✅ No authentication headers needed
      const response = await axios.delete(`http://localhost:5000/api/class/delete/${classId}`);
      
      console.log("Delete response:", response.data); // Debug log
      alert("Class deleted successfully!");
      setSelectedClass(null); // Clear selection if deleted class was selected
      fetchClasses(); // Refresh data
    } catch (err) {
      console.error("Failed to delete class:", err); // Debug log
      console.error("Error response:", err.response?.data); // More debug info
      
      if (err.response?.status === 404) {
        alert("Class not found.");
      } else {
        alert("Failed to delete class: " + (err.response?.data?.msg || err.message));
      }
    }
  };

  // Start editing student
  const startEdit = (student) => {
    setEditingStudent(student._id);
    setEditForm({
      username: student.username || "",
      email: student.email || ""
    });
  };

  // Save edited student
  const saveEdit = async () => {
    if (!editForm.username.trim() || !editForm.email.trim()) {
      alert("Username and email cannot be empty");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/user/update/${editingStudent}`, {
        username: editForm.username,
        email: editForm.email
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Student updated successfully!");
      setEditingStudent(null);
      fetchClasses(); // Refresh data
      if (selectedClass) {
        fetchStudentsForClass(selectedClass);
      }
    } catch (err) {
      console.error("Failed to update student", err);
      alert("Failed to update student: " + (err.response?.data?.msg || err.message));
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingStudent(null);
    setEditForm({ username: "", email: "" });
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudentsForClass(selectedClass);
    }
  }, [classes, selectedClass]);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>📘 Teacher Dashboard</h2>

      {/* Create Class Section */}
      <div style={{ marginBottom: "30px", padding: "15px", border: "1px solid #ddd", borderRadius: "8px" }}>
        <CreateClass onClassCreated={fetchClasses} />
      </div>

      {/* Add Student Section */}
      <div style={{ marginBottom: "30px", padding: "15px", border: "1px solid #ddd", borderRadius: "8px" }}>
        <AddStudent classes={classes} onStudentAdded={fetchClasses} />
      </div>

      {/* Classes Overview */}
      <div style={{ marginBottom: "30px" }}>
        <h3>📋 All Classes</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {classes.length === 0 ? (
            <p>No classes available.</p>
          ) : (
            classes.map((cls) => (
              <div
                key={cls._id}
                style={{
                  padding: "10px 15px",
                  border: selectedClass === cls._id ? "2px solid #007bff" : "1px solid #ccc",
                  borderRadius: "5px",
                  backgroundColor: selectedClass === cls._id ? "#e3f2fd" : "#f9f9f9",
                  minWidth: "180px",
                  position: "relative"
                }}
              >
                <div
                  onClick={() => setSelectedClass(cls._id)}
                  style={{ cursor: "pointer", textAlign: "center" }}
                >
                  <strong>{cls.className}</strong>
                  <br />
                  <small>{cls.students?.length || 0} student(s)</small>
                </div>
                <button
                  onClick={() => deleteClass(cls._id, cls.className)}
                  style={{
                    position: "absolute",
                    top: "5px",
                    right: "5px",
                    background: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "3px",
                    width: "20px",
                    height: "20px",
                    fontSize: "10px",
                    cursor: "pointer"
                  }}
                  title="Delete Class"
                >
                  ❌
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Students Table */}
      {selectedClass && (
        <div style={{ marginTop: "30px" }}>
          <h3>👥 Students in Selected Class</h3>
          {students.length === 0 ? (
            <p>No students enrolled in this class.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{
                width: "100%",
                borderCollapse: "collapse",
                border: "1px solid #ddd",
                marginTop: "10px"
              }}>
                <thead>
                  <tr style={{ backgroundColor: "#f5f5f5" }}>
                    <th style={tableHeaderStyle}>ID</th>
                    <th style={tableHeaderStyle}>Username</th>
                    <th style={tableHeaderStyle}>Email</th>
                    <th style={tableHeaderStyle}>Role</th>
                    <th style={tableHeaderStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => (
                    <tr key={student._id || index} style={{ borderBottom: "1px solid #ddd" }}>
                      <td style={tableCellStyle}>{student._id?.slice(-6) || 'N/A'}</td>
                      <td style={tableCellStyle}>
                        {editingStudent === student._id ? (
                          <input
                            type="text"
                            value={editForm.username}
                            onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                            style={{ width: "100%", padding: "4px" }}
                          />
                        ) : (
                          student.username || student.name || 'N/A'
                        )}
                      </td>
                      <td style={tableCellStyle}>
                        {editingStudent === student._id ? (
                          <input
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            style={{ width: "100%", padding: "4px" }}
                          />
                        ) : (
                          student.email || 'N/A'
                        )}
                      </td>
                      <td style={tableCellStyle}>
                        <span style={{
                          padding: "2px 8px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          backgroundColor: student.role === 'student' ? '#e8f5e8' : '#fff3cd',
                          color: student.role === 'student' ? '#155724' : '#856404'
                        }}>
                          {student.role || 'student'}
                        </span>
                      </td>
                      <td style={tableCellStyle}>
                        {editingStudent === student._id ? (
                          <div style={{ display: "flex", gap: "5px" }}>
                            <button
                              onClick={saveEdit}
                              style={{ ...buttonStyle, backgroundColor: "#28a745", color: "white" }}
                            >
                              ✅ Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              style={{ ...buttonStyle, backgroundColor: "#6c757d", color: "white" }}
                            >
                              ❌ Cancel
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                            <button
                              onClick={() => startEdit(student)}
                              style={{ ...buttonStyle, backgroundColor: "#ffc107" }}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => removeStudentFromClass(student._id, selectedClass)}
                              style={{ ...buttonStyle, backgroundColor: "#17a2b8", color: "white" }}
                              title="Remove from class only"
                            >
                              📤 Remove
                            </button>
                            <button
                              onClick={() => deleteStudentPermanently(student._id)}
                              style={{ ...buttonStyle, backgroundColor: "#dc3545", color: "white" }}
                              title="Delete student account permanently"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Styles
const tableHeaderStyle = {
  padding: "12px 8px",
  textAlign: "left",
  borderBottom: "2px solid #ddd",
  backgroundColor: "#f8f9fa",
  fontWeight: "bold"
};

const tableCellStyle = {
  padding: "10px 8px",
  borderBottom: "1px solid #eee"
};

const buttonStyle = {
  padding: "4px 8px",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "12px"
};