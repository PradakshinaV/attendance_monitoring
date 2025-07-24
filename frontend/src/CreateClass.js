// src/components/CreateClass.js

import { useState } from 'react';
import axios from 'axios';

export default function CreateClass() {
  const [className, setClassName] = useState('');
  const [teacher, setTeacher] = useState('');

  const handleCreate = async () => {
    if (!className || !teacher) {
      alert("Please fill in both Class Name and Teacher Name.");
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/class/create', { className, teacher });
      alert('✅ Class created successfully');
      setClassName('');
      setTeacher('');
    } catch (error) {
      console.error("❌ Error creating class:", error);
      alert('❌ Failed to create class');
    }
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <h3>Create New Class</h3>
      <input
        placeholder="📘 Class Name"
        value={className}
        onChange={e => setClassName(e.target.value)}
        style={{ marginRight: "10px", padding: "5px" }}
      />
      <input
        placeholder="👨‍🏫 Teacher Name"
        value={teacher}
        onChange={e => setTeacher(e.target.value)}
        style={{ marginRight: "10px", padding: "5px" }}
      />
      <button onClick={handleCreate} style={{ padding: "6px 12px" }}>
        ➕ Create
      </button>
    </div>
  );
}
