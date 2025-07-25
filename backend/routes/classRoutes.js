// routes/classRoutes.js - WITHOUT AUTHENTICATION (Temporary Fix)
const express = require('express');
const router = express.Router();
const Class = require('../models/Class');
const User = require('../models/User');
// const verifyToken = require('../middleware/verifyToken'); // ❌ Commented out

// Create a new class (NO AUTH)
router.post('/create', async (req, res) => {
  const { className } = req.body;

  if (!className) {
    return res.status(400).json({ msg: "Class name is required" });
  }

  try {
    const newClass = new Class({
      className,
      teacher: "dummy-teacher-id", // ✅ Dummy teacher ID
      students: []
    });

    await newClass.save();
    console.log("Class created:", newClass.className);
    res.status(201).json({ msg: "Class created", class: newClass });
  } catch (err) {
    console.error("Create class error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Add student by email (NO AUTH)
router.post('/add-student', async (req, res) => {
  const { classId, studentEmail } = req.body;

  if (!classId || !studentEmail) {
    return res.status(400).json({ msg: "Class ID and student email are required" });
  }

  try {
    const student = await User.findOne({ email: studentEmail });
    if (!student) {
      return res.status(404).json({ msg: "Student not found with this email" });
    }

    const updatedClass = await Class.findByIdAndUpdate(classId, {
      $addToSet: { students: student._id }
    }, { new: true });

    if (!updatedClass) {
      return res.status(404).json({ msg: "Class not found" });
    }

    console.log("Student added to class:", student.email);
    res.json({ msg: "Student added to class" });
  } catch (err) {
    console.error("Add student error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Remove student from class (NO AUTH)
router.delete('/remove-student', async (req, res) => {
  const { classId, studentId } = req.body;

  if (!classId || !studentId) {
    return res.status(400).json({ msg: "Class ID and student ID are required" });
  }

  try {
    const updatedClass = await Class.findByIdAndUpdate(classId, {
      $pull: { students: studentId }
    }, { new: true });

    if (!updatedClass) {
      return res.status(404).json({ msg: "Class not found" });
    }

    console.log("Student removed from class:", studentId);
    res.json({ msg: "Student removed from class" });
  } catch (err) {
    console.error("Remove student error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Delete entire class (NO AUTH) ✅ THIS IS THE IMPORTANT ONE
router.delete('/delete/:classId', async (req, res) => {
  const { classId } = req.params;

  try {
    console.log("Attempting to delete class:", classId); // Debug log

    const existingClass = await Class.findById(classId);
    if (!existingClass) {
      console.log("Class not found:", classId);
      return res.status(404).json({ msg: "Class not found" });
    }

    const deletedClass = await Class.findByIdAndDelete(classId);
    console.log("✅ Class deleted successfully:", deletedClass.className);
    
    res.json({ msg: "Class deleted successfully", deletedClass });
  } catch (err) {
    console.error("❌ Delete class error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get all classes (NO AUTH)
router.get('/all', async (req, res) => {
  try {
    const classes = await Class.find()
      .populate('teacher', 'username email role')
      .populate('students', 'username email role');

    console.log("Classes fetched:", classes.length);
    res.json(classes);
  } catch (err) {
    console.error("Fetch classes error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;