import { useState, useEffect } from "react";
import axios from "axios";

export default function AddStudent() {
  const [studentName, setStudentName] = useState("");
  const [classId, setClassId] = useState("");
  const [classes, setClasses] = useState([]); // ✅ Default to empty array

  useEffect(() => {
    axios.get("http://localhost:5000/api/class/all")
      .then(res => setClasses(res.data))
      .catch(err => {
        console.error("Error fetching classes:", err);
        setClasses([]); // ✅ Ensure fallback value even if error
      });
  }, []);

  const handleAdd = async () => {
    if (!studentName || !classId) {
      alert("Please fill in all fields");
      return;
    }
    try {
      await axios.post("http://localhost:5000/api/class/add-student", {
        studentName,
        classId
      });
      alert("Student added");
    } catch (err) {
      console.error("Error adding student:", err);
      alert("Failed to add student");
    }
  };

  return (
    <div>
      <h3>Add Student</h3>
      <input
        placeholder="Student Name"
        onChange={e => setStudentName(e.target.value)}
        value={studentName}
      />
      <select
        onChange={e => setClassId(e.target.value)}
        value={classId}
      >
        <option value="">Select Class</option>
        {classes.map(cls => (
          <option key={cls._id} value={cls._id}>{cls.className}</option>
        ))}
      </select>
      <button onClick={handleAdd}>Add</button>
    </div>
  );
}
