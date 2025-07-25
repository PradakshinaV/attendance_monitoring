// ===== FIX 2: Updated classRoutes.js with PROPER AUTHENTICATION =====
const express = require('express');
const router = express.Router();
const Class = require('../models/Class');
const User = require("../models/User");

const verifyToken = require('../middleware/verifyToken'); // ✅ ENABLED

// Create a new class (WITH AUTHENTICATION)
router.post('/create', verifyToken, async (req, res) => {
  const { className, classLat, classLng, radiusMeters } = req.body;

  if (!className) {
    return res.status(400).json({ msg: "Class name is required" });
  }

  // Only teachers and admins can create classes
  if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
    return res.status(403).json({ msg: "Only teachers and admins can create classes" });
  }

  try {
    const newClass = new Class({
      className,
      teacher: req.user.userId, // ✅ Use actual authenticated teacher ID
      students: [],
      classLat: classLat || null,
      classLng: classLng || null,
      radiusMeters: radiusMeters || 50
    });

    await newClass.save();
    console.log("Class created by:", req.user.userId, "Class:", newClass.className);
    
    // Populate teacher info for response
    await newClass.populate('teacher', 'username email');
    
    res.status(201).json({ 
      msg: "Class created successfully", 
      class: newClass 
    });
  } catch (err) {
    console.error("Create class error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Add student by email (WITH AUTHENTICATION)
router.post('/add-student', verifyToken, async (req, res) => {
  const { classId, studentEmail } = req.body;

  if (!classId || !studentEmail) {
    return res.status(400).json({ msg: "Class ID and student email are required" });
  }

  try {
    // Check if user is teacher of this class or admin
    const classToUpdate = await Class.findById(classId);
    if (!classToUpdate) {
      return res.status(404).json({ msg: "Class not found" });
    }

    if (req.user.role !== 'admin' && classToUpdate.teacher.toString() !== req.user.userId) {
      return res.status(403).json({ msg: "You can only add students to your own classes" });
    }

    // Find student by email
    const student = await User.findOne({ email: studentEmail, role: 'student' });
    if (!student) {
      return res.status(404).json({ msg: "Student not found with this email" });
    }

    // Check if student is already in class
    if (classToUpdate.students.includes(student._id)) {
      return res.status(400).json({ msg: "Student is already in this class" });
    }

    const updatedClass = await Class.findByIdAndUpdate(classId, {
      $addToSet: { students: student._id }
    }, { new: true }).populate('students', 'username email role');

    console.log("Student added to class:", student.email, "by:", req.user.userId);
    res.json({ 
      msg: "Student added to class successfully",
      student: {
        id: student._id,
        username: student.username,
        email: student.email
      }
    });
  } catch (err) {
    console.error("Add student error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Remove student from class (WITH AUTHENTICATION)
router.delete('/remove-student', verifyToken, async (req, res) => {
  const { classId, studentId } = req.body;

  if (!classId || !studentId) {
    return res.status(400).json({ msg: "Class ID and student ID are required" });
  }

  try {
    // Check if user is teacher of this class or admin
    const classToUpdate = await Class.findById(classId);
    if (!classToUpdate) {
      return res.status(404).json({ msg: "Class not found" });
    }

    if (req.user.role !== 'admin' && classToUpdate.teacher.toString() !== req.user.userId) {
      return res.status(403).json({ msg: "You can only remove students from your own classes" });
    }

    const updatedClass = await Class.findByIdAndUpdate(classId, {
      $pull: { students: studentId }
    }, { new: true });

    console.log("Student removed from class:", studentId, "by:", req.user.userId);
    res.json({ msg: "Student removed from class successfully" });
  } catch (err) {
    console.error("Remove student error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Delete entire class (WITH AUTHENTICATION)
router.delete('/delete/:classId', verifyToken, async (req, res) => {
  const { classId } = req.params;

  try {
    console.log("Attempting to delete class:", classId, "by user:", req.user.userId);

    const existingClass = await Class.findById(classId);
    if (!existingClass) {
      console.log("Class not found:", classId);
      return res.status(404).json({ msg: "Class not found" });
    }

    // Check if user is teacher of this class or admin
    if (req.user.role !== 'admin' && existingClass.teacher.toString() !== req.user.userId) {
      return res.status(403).json({ msg: "You can only delete your own classes" });
    }

    const deletedClass = await Class.findByIdAndDelete(classId);
    console.log("✅ Class deleted successfully:", deletedClass.className, "by:", req.user.userId);
        
    res.json({ 
      msg: "Class deleted successfully", 
      deletedClass: {
        id: deletedClass._id,
        name: deletedClass.className
      }
    });
  } catch (err) {
    console.error("❌ Delete class error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get all classes (FILTERED BY USER ROLE)
router.get('/all', verifyToken, async (req, res) => {
  try {
    let classQuery = {};
    
    // Students see only classes they're enrolled in
    if (req.user.role === 'student') {
      classQuery = { students: { $in: [req.user.userId] } };
    } 
    // Teachers see only their own classes
    else if (req.user.role === 'teacher') {
      classQuery = { teacher: req.user.userId };
    }
    // Admins see all classes (no filter)

    const classes = await Class.find(classQuery)
      .populate('teacher', 'username email role')
      .populate('students', 'username email role')
      .sort({ createdAt: -1 });

    console.log("Classes fetched for user:", req.user.userId, "Role:", req.user.role, "Count:", classes.length);
    res.json(classes);
  } catch (err) {
    console.error("Fetch classes error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get specific class details (WITH PERMISSION CHECK)
router.get('/:classId', verifyToken, async (req, res) => {
  const { classId } = req.params;
  
  try {
    const classData = await Class.findById(classId)
      .populate('teacher', 'username email role')
      .populate('students', 'username email role');
    
    if (!classData) {
      return res.status(404).json({ msg: "Class not found" });
    }

    // Check permissions
    const isTeacher = classData.teacher._id.toString() === req.user.userId;
    const isStudent = classData.students.some(student => student._id.toString() === req.user.userId);
    const isAdmin = req.user.role === 'admin';

    if (!isTeacher && !isStudent && !isAdmin) {
      return res.status(403).json({ msg: "Access denied to this class" });
    }

    res.json(classData);
  } catch (err) {
    console.error("Get class error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Update class location (TEACHERS ONLY)
router.put('/update-location/:classId', verifyToken, async (req, res) => {
  const { classId } = req.params;
  const { classLat, classLng, radiusMeters } = req.body;

  if (!classLat || !classLng) {
    return res.status(400).json({ msg: "Class latitude and longitude are required" });
  }

  try {
    const classToUpdate = await Class.findById(classId);
    if (!classToUpdate) {
      return res.status(404).json({ msg: "Class not found" });
    }

    // Check if user is teacher of this class or admin
    if (req.user.role !== 'admin' && classToUpdate.teacher.toString() !== req.user.userId) {
      return res.status(403).json({ msg: "You can only update your own classes" });
    }

    const updatedClass = await Class.findByIdAndUpdate(classId, {
      classLat: parseFloat(classLat),
      classLng: parseFloat(classLng),
      radiusMeters: radiusMeters ? parseInt(radiusMeters) : 50
    }, { new: true });

    console.log("Class location updated:", classId, "by:", req.user.userId);
    res.json({ 
      msg: "Class location updated successfully", 
      class: updatedClass 
    });
  } catch (err) {
    console.error("Update class location error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get my classes (for current user)
router.get('/my/classes', verifyToken, async (req, res) => {
  try {
    let classes = [];
    
    if (req.user.role === 'teacher') {
      classes = await Class.find({ teacher: req.user.userId })
        .populate('students', 'username email')
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'student') {
      classes = await Class.find({ students: { $in: [req.user.userId] } })
        .populate('teacher', 'username email')
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'admin') {
      classes = await Class.find({})
        .populate('teacher', 'username email')
        .populate('students', 'username email')
        .sort({ createdAt: -1 });
    }

    res.json({
      userRole: req.user.role,
      totalClasses: classes.length,
      classes: classes
    });
  } catch (err) {
    console.error("Get my classes error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
