import React, { useState } from "react";
import CSVDownload from "./CSVDownload";
import "../styles.css";

function AdminDashboard({ students, setStudents }) {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editData, setEditData] = useState({});

  const deleteStudent = (index) => {
    const updated = [...students];
    updated.splice(index, 1);
    setStudents(updated);
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setEditData(students[index]);
  };

  const handleSave = () => {
    if (!editData.name?.trim() || !editData.id?.trim()) {
      alert("Name and ID cannot be empty");
      return;
    }
    const updated = [...students];
    updated[editingIndex] = editData;
    setStudents(updated);
    setEditingIndex(null);
  };

  return (
    <div className="dashboard-section">
      <h2>Admin Dashboard</h2>
      <CSVDownload data={students} />
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>ID</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr key={index}>
              <td>
                {editingIndex === index ? (
                  <input
                    value={editData.name || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, name: e.target.value })
                    }
                  />
                ) : (
                  student.name
                )}
              </td>
              <td>
                {editingIndex === index ? (
                  <input
                    value={editData.id || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, id: e.target.value })
                    }
                  />
                ) : (
                  student.id
                )}
              </td>
              <td>{student.status || "--"}</td>
              <td>
                {editingIndex === index ? (
                  <>
                    <button onClick={handleSave}>Save</button>
                    <button onClick={() => setEditingIndex(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEdit(index)}>Edit</button>
                    <button onClick={() => deleteStudent(index)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboard;
