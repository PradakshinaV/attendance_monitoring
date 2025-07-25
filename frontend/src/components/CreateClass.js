// CreateClass.js
import { useState } from "react";
import axios from "axios";

export default function CreateClass({ onClassCreated }) {
  const [className, setClassName] = useState("");

  const handleCreate = async () => {
    if (!className.trim()) return;

    try {
      await axios.post("http://localhost:5000/api/class/create", {
        className: className.trim(),
      });
      setClassName("");
      onClassCreated(); // refresh class list in dashboard
    } catch (err) {
      console.error("Failed to create class", err);
    }
  };

  return (
    <div>
      <input
        value={className}
        onChange={(e) => setClassName(e.target.value)}
        placeholder="Enter class name"
      />
      <button onClick={handleCreate}>Create</button>
    </div>
  );
}
