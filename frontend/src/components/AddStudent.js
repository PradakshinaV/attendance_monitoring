import React, { useState } from "react";

const AddStudent = () => {
  const [studentName, setStudentName] = useState("");
  const [students, setStudents] = useState([]);

  const handleAdd = () => {
    if (studentName.trim()) {
      setStudents([...students, studentName]);
      setStudentName("");
    }
  };

  return (
    <div>
      <h3>Add Student</h3>
      <input
        type="text"
        placeholder="Student name"
        value={studentName}
        onChange={(e) => setStudentName(e.target.value)}
      />
      <button onClick={handleAdd}>Add</button>
      <ul>
        {students.map((stu, index) => (
          <li key={index}>{stu}</li>
        ))}
      </ul>
    </div>
  );
};

export default AddStudent;
