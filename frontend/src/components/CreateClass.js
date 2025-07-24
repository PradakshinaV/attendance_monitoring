import React, { useState } from "react";

const CreateClass = () => {
  const [className, setClassName] = useState("");
  const [classes, setClasses] = useState([]);

  const handleCreate = () => {
    const trimmed = className.trim();
    if (trimmed && !classes.includes(trimmed)) {
      setClasses([...classes, trimmed]);
      setClassName("");
    }
  };

  return (
    <div>
      <h3>Create Class</h3>
      <input
        type="text"
        placeholder="Enter class name"
        value={className}
        onChange={(e) => setClassName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleCreate()}
      />
      <button onClick={handleCreate}>Create</button>
      <ul>
        {classes.map((cls, index) => (
          <li key={index}>{cls}</li>
        ))}
      </ul>
    </div>
  );
};

export default CreateClass;
