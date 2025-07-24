import { useEffect, useState } from 'react';
import axios from 'axios';

export default function StudentList() {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/class/all')
      .then(res => setClasses(res.data))
      .catch(err => console.error("Error fetching classes:", err));
  }, []);

  return (
    <div>
      <h3>All Classes</h3>
      {classes.map(cls => (
        <div key={cls._id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
          <h4>📚 {cls.className}</h4>
          <p>👨‍🏫 Teacher: {cls.teacher}</p>
          <ul>
            {cls.students.map((s, i) => (
              <li key={i}>👤 {s}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
