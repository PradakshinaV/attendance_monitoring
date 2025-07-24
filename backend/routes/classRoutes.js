const express = require('express');
const router = express.Router();
const Class = require('../models/Class');

// Create a new class
router.post('/create', async (req, res) => {
  const { className, teacher } = req.body;
  const newClass = new Class({ className, teacher, students: [] });
  await newClass.save();
  res.send('Class created');
});

// Add student to class
router.post('/add-student', async (req, res) => {
  const { classId, studentEmail } = req.body;
  await Class.findByIdAndUpdate(classId, { $push: { students: studentEmail } });
  res.send('Student added');
});

// Get all classes and students
router.get('/all', async (req, res) => {
  const classes = await Class.find();
  res.json(classes);
});

module.exports = router;
