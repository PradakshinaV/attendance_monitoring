import { useState } from 'react';
import axios from 'axios';

export default function CreateClass() {
  const [className, setClassName] = useState('');
  const [teacher, setTeacher] = useState('');

  const handleCreate = async () => {
    await axios.post('http://localhost:5000/api/class/create', { className, teacher });
    alert('Class created');
  };

  return (
    <div>
      <h3>Create Class</h3>
      <input placeholder="Class Name" onChange={e => setClassName(e.target.value)} />
      <input placeholder="Teacher Name" onChange={e => setTeacher(e.target.value)} />
      <button onClick={handleCreate}>Create</button>
    </div>
  );
}
