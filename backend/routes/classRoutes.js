const express = require('express');
const router = express.Router();
const Class = require('../models/Class');
const User = require('../models/User'); // for email lookup (optional)
const verifyToken = require('../middleware/verifyToken');

// Create a new class (restricted to teacher/admin)
router.post('/create', verifyToken, async (req, res) => {
  const { className } = req.body;

  if (!className) {
    return res.status(400).json({ msg: "Class name is required" });
  }

  try {
    const newClass = new Class({
      className,
      teacher: req.user.userId,  // from JWT
      students: []
    });

    await newClass.save();
    res.status(201).json({ msg: "Class created", class: newClass });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add student by email (optional: convert email → ObjectId)
router.post('/add-student', verifyToken, async (req, res) => {
  const { classId, studentEmail } = req.body;

  if (!classId || !studentEmail) {
    return res.status(400).json({ msg: "Class ID and student email are required" });
  }

  try {
    const student = await User.findOne({ email: studentEmail });
    if (!student) return res.status(404).json({ msg: "Student not found" });

    await Class.findByIdAndUpdate(classId, {
      $addToSet: { students: student._id }  // avoids duplicate entries
    });

    res.json({ msg: "Student added to class" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all classes with populated teacher/students
router.get('/all', verifyToken, async (req, res) => {
  try {
    const classes = await Class.find()
      .populate('teacher', 'username email role')
      .populate('students', 'username email');

    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
