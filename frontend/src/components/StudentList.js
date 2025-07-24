// src/components/StudentList.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function StudentList() {
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/api/class/all')
      .then((res) => {
        setClasses(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching classes:", err);
        setError("❌ Failed to fetch class list.");
        setLoading(false);
      });
  }, []);

  if (loading) return <p>⏳ Loading classes...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h3>📚 All Classes</h3>
      {classes.length === 0 ? (
        <p>No classes available.</p>
      ) : (
        classes.map((cls) => (
          <div
            key={cls._id}
            style={{
              border: '1px solid #ccc',
              margin: '10px 0',
              padding: '10px',
              borderRadius: '8px',
              backgroundColor: '#f9f9f9'
            }}
          >
            <h4>📖 Class: {cls.className}</h4>
            <p>👨‍🏫 Teacher: {cls.teacher}</p>
            <h5>👥 Students:</h5>
            <ul>
              {cls.students.length > 0 ? (
                cls.students.map((s, i) => (
                  <li key={i}>👤 {s}</li>
                ))
              ) : (
                <li>No students enrolled.</li>
              )}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
