// ===== FIX 1: Updated locationRoutes.js with Enhanced Boundary Tracking =====
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Class = require("../models/Class");
const StudentLocation = require("../models/StudentLocation");
const verifyToken = require("../middleware/verifyToken");

// Distance calculator function
function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371e3;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 📍 POST /api/location/send-location - ENHANCED VERSION
router.post("/send-location", verifyToken, async (req, res) => {
  const { latitude, longitude, timestamp, accuracy } = req.body;
  const userId = req.user.userId;

  try {
    // Find student's class
    const classes = await Class.find({ students: { $in: [userId] } });
    if (!classes.length) {
      return res.status(404).json({ error: "Student not in any class" });
    }

    const classObj = classes[0];
    const { classLat, classLng, radiusMeters = 50 } = classObj;

    if (!classLat || !classLng) {
      return res.status(400).json({ error: "Class location not configured" });
    }

    const distance = calculateDistance(latitude, longitude, classLat, classLng);
    const isWithinBoundary = distance <= radiusMeters;

    // Find or create student location record
    let studentLocation = await StudentLocation.findOne({
      studentId: userId,
      classId: classObj._id
    });

    const currentTime = new Date();
    let boundaryStatus = 'inside';
    let outsideDuration = 0;
    let alertTriggered = false;

    if (!studentLocation) {
      // Create new record
      studentLocation = new StudentLocation({
        studentId: userId,
        classId: classObj._id,
        latitude,
        longitude,
        timestamp: currentTime,
        status: isWithinBoundary ? "Present" : "Left",
        classroomBoundary: {
          center: { lat: classLat, lng: classLng },
          radius: radiusMeters
        },
        boundaryStatus: isWithinBoundary ? 'inside' : 'just_left',
        isWithinBoundary,
        distanceFromClass: distance
      });

      if (!isWithinBoundary) {
        studentLocation.outsideBoundarySession = {
          startTime: currentTime,
          maxDistance: distance,
          alertSent: false,
          staffNotified: false
        };
      }
    } else {
      // Update existing record
      const wasWithinBoundary = studentLocation.isWithinBoundary;
      
      studentLocation.latitude = latitude;
      studentLocation.longitude = longitude;
      studentLocation.timestamp = currentTime;
      studentLocation.distanceFromClass = distance;
      studentLocation.isWithinBoundary = isWithinBoundary;

      // Handle boundary transitions
      if (wasWithinBoundary && !isWithinBoundary) {
        // Just left the boundary
        boundaryStatus = 'just_left';
        studentLocation.boundaryStatus = 'just_left';
        studentLocation.status = "Left";
        studentLocation.outsideBoundarySession = {
          startTime: currentTime,
          maxDistance: distance,
          alertSent: false,
          staffNotified: false
        };
      } else if (!wasWithinBoundary && isWithinBoundary) {
        // Returned to boundary
        boundaryStatus = 'inside';
        studentLocation.boundaryStatus = 'inside';
        studentLocation.status = "Returned";
        
        // Close outside session
        if (studentLocation.outsideBoundarySession && studentLocation.outsideBoundarySession.startTime) {
          studentLocation.outsideBoundarySession.endTime = currentTime;
          studentLocation.outsideBoundarySession.duration = 
            (currentTime - studentLocation.outsideBoundarySession.startTime) / (1000 * 60);
        }

        // Add return alert
        studentLocation.alerts.push({
          type: "returned_to_class",
          timestamp: currentTime,
          location: { lat: latitude, lng: longitude },
          distance: distance,
          message: "Student returned to classroom",
          resolved: true
        });
      } else if (!isWithinBoundary) {
        // Still outside - check duration
        if (studentLocation.outsideBoundarySession && studentLocation.outsideBoundarySession.startTime) {
          outsideDuration = (currentTime - studentLocation.outsideBoundarySession.startTime) / (1000 * 60);
          
          // Update max distance
          if (distance > studentLocation.outsideBoundarySession.maxDistance) {
            studentLocation.outsideBoundarySession.maxDistance = distance;
          }

          if (outsideDuration >= 5) {
            boundaryStatus = 'long_absence';
            studentLocation.boundaryStatus = 'long_absence';
            studentLocation.status = "Long_Absence";

            // Send alert if not already sent
            if (!studentLocation.outsideBoundarySession.alertSent) {
              studentLocation.outsideBoundarySession.alertSent = true;
              studentLocation.outsideBoundarySession.staffNotified = true;
              alertTriggered = true;

              studentLocation.alerts.push({
                type: "outside_boundary_5min",
                timestamp: currentTime,
                location: { lat: latitude, lng: longitude },
                distance: distance,
                message: `Student outside classroom for ${outsideDuration.toFixed(1)} minutes`,
                staffNotified: true
              });
            }
          } else {
            boundaryStatus = 'outside';
            studentLocation.boundaryStatus = 'outside';
          }
        }
      } else {
        // Inside boundary
        boundaryStatus = 'inside';
        studentLocation.boundaryStatus = 'inside';
        studentLocation.status = "Present";
      }
    }

    // Save the updated location
    await studentLocation.save();

    // Prepare response with all required fields for frontend
    const response = {
      message: "Location updated successfully",
      status: studentLocation.status,
      distance: Math.round(distance),
      inRange: isWithinBoundary,
      // Frontend compatibility fields:
      isWithinBoundary: isWithinBoundary,
      distanceFromClass: Math.round(distance),
      boundaryStatus: boundaryStatus,
      outsideDuration: outsideDuration,
      alertTriggered: alertTriggered,
      accuracy: accuracy || null
    };

    res.json(response);

  } catch (err) {
    console.error("Error in /send-location:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 📊 GET /api/location/status/:studentId - Enhanced with boundary info
router.get("/status/:studentId", verifyToken, async (req, res) => {
  const { studentId } = req.params;
  
  try {
    const studentLocation = await StudentLocation.findOne({
      studentId: studentId
    }).populate('classId', 'className');

    if (!studentLocation) {
      return res.status(404).json({ error: "No location data found for student" });
    }

    const response = {
      student: studentLocation.studentId,
      class: studentLocation.classId,
      currentStatus: studentLocation.status,
      boundaryStatus: studentLocation.boundaryStatus,
      distanceFromClass: studentLocation.distanceFromClass,
      isWithinBoundary: studentLocation.isWithinBoundary,
      lastUpdate: studentLocation.lastUpdate,
      locationHistory: studentLocation.locationHistory.slice(-10), // Last 10 points
      alerts: studentLocation.alerts.slice(-5), // Last 5 alerts
      outsideDuration: studentLocation.getOutsideDuration()
    };

    res.json(response);
  } catch (err) {
    console.error("Error fetching student status:", err);
    res.status(500).json({ error: "Failed to fetch student status" });
  }
});

// 📋 GET /api/location/class-overview/:classId - For teacher dashboard
router.get("/class-overview/:classId", verifyToken, async (req, res) => {
  const { classId } = req.params;
  
  try {
    const studentLocations = await StudentLocation.find({
      classId: classId
    }).populate('studentId', 'username email');

    const overview = studentLocations.map(location => ({
      student: {
        id: location.studentId._id,
        name: location.studentId.username,
        email: location.studentId.email
      },
      status: location.status,
      boundaryStatus: location.boundaryStatus,
      distanceFromClass: Math.round(location.distanceFromClass),
      isWithinBoundary: location.isWithinBoundary,
      lastUpdate: location.lastUpdate,
      outsideDuration: location.getOutsideDuration(),
      hasAlerts: location.alerts.some(alert => !alert.resolved)
    }));

    res.json({
      classId: classId,
      totalStudents: overview.length,
      studentsPresent: overview.filter(s => s.isWithinBoundary).length,
      studentsOutside: overview.filter(s => !s.isWithinBoundary).length,
      alertsActive: overview.filter(s => s.hasAlerts).length,
      students: overview
    });
  } catch (err) {
    console.error("Error fetching class overview:", err);
    res.status(500).json({ error: "Failed to fetch class overview" });
  }
});

// 🚨 GET /api/location/alerts - Get all active alerts for teachers
router.get("/alerts", verifyToken, async (req, res) => {
  try {
    const activeAlerts = await StudentLocation.find({
      "alerts.resolved": false
    }).populate('studentId', 'username email')
      .populate('classId', 'className');

    const formattedAlerts = [];
    
    activeAlerts.forEach(location => {
      location.alerts.forEach(alert => {
        if (!alert.resolved) {
          formattedAlerts.push({
            id: alert._id,
            student: {
              name: location.studentId.username,
              email: location.studentId.email
            },
            class: location.classId.className,
            type: alert.type,
            message: alert.message,
            timestamp: alert.timestamp,
            location: alert.location,
            distance: alert.distance,
            staffNotified: alert.staffNotified
          });
        }
      });
    });

    res.json({
      totalAlerts: formattedAlerts.length,
      alerts: formattedAlerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    });
  } catch (err) {
    console.error("Error fetching alerts:", err);
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
});

// ✅ POST /api/location/resolve-alert - Mark alert as resolved
router.post("/resolve-alert", verifyToken, async (req, res) => {
  const { studentId, alertId } = req.body;
  
  try {
    const result = await StudentLocation.updateOne(
      { studentId: studentId, "alerts._id": alertId },
      { $set: { "alerts.$.resolved": true } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Alert not found" });
    }

    res.json({ message: "Alert resolved successfully" });
  } catch (err) {
    console.error("Error resolving alert:", err);
    res.status(500).json({ error: "Failed to resolve alert" });
  }
});

module.exports = router;