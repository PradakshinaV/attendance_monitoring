import { useState } from "react";
import axios from "axios";

export default function AddStudent({ classes = [], onStudentAdded }) {
  const [studentEmail, setStudentEmail] = useState(""); // ✅ Changed from studentName
  const [classId, setClassId] = useState("");

  const handleAddStudent = async () => {
    if (!studentEmail || !classId) {
      alert("Please fill both email and select a class");
      return;
    }

    try {
      const token = localStorage.getItem('token'); // ✅ Get auth token
      await axios.post("http://localhost:5000/api/class/add-student", {
        studentEmail, // ✅ Fixed parameter name
        classId,
      }, {
        headers: { Authorization: `Bearer ${token}` } // ✅ Add auth header
      });
      setStudentEmail("");
      setClassId("");
      alert("Student added!");
      onStudentAdded(); // Refresh class list
    } catch (err) {
      console.error("Failed to add student", err);
      alert("Failed to add student: " + (err.response?.data?.msg || err.message));
    }
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <h3>Add Student to Class</h3>
      <input
        value={studentEmail}
        onChange={(e) => setStudentEmail(e.target.value)}
        placeholder="Enter student email" // ✅ Updated placeholder
        style={{ marginRight: "10px", padding: "5px" }}
      />
      <select 
        value={classId} 
        onChange={(e) => setClassId(e.target.value)}
        style={{ marginRight: "10px", padding: "5px" }}
      >
        <option value="">Select Class</option>
        {classes.length > 0 ? (
          classes.map((cls) => (
            <option key={cls._id} value={cls._id}>
              {cls.className}
            </option>
          ))
        ) : (
          <option disabled>No classes available</option>
        )}
      </select>
      <button onClick={handleAddStudent} style={{ padding: "6px 12px" }}>
        ➕ Add Student
      </button>
    </div>
  );
}