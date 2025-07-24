import React from "react";
import CreateClass from "./CreateClass";
import AddStudent from "./AddStudent";
import StudentList from "./StudentList";

const TeacherDashboard = () => {
  return (
    <div>
      <h2>Teacher Dashboard</h2>
      <CreateClass />
      <AddStudent />
      <StudentList />
    </div>
  );
};

export default TeacherDashboard;
