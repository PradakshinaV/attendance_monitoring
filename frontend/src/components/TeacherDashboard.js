// src/components/TeacherDashboard.js

import React from "react";
import CreateClass from "./CreateClass";
import AddStudent from "./AddStudent";
import StudentList from "./StudentList";

const TeacherDashboard = () => {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>📘 Teacher Dashboard</h2>
      
      <section style={{ marginBottom: "30px" }}>
        <h3>📝 Create Class</h3>
        <CreateClass />
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h3>👥 Add Student</h3>
        <AddStudent />
      </section>

      <section>
        <h3>📋 View All Classes</h3>
        <StudentList />
      </section>
    </div>
  );
};

export default TeacherDashboard;
