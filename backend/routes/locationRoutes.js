const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Class = require("../models/Class");
const StudentLocation = require("../models/StudentLocation"); // ✅ Now exists
const verifyToken = require("../middleware/verifyToken"); // ✅ Use consistent middleware

// 🌍 Distance calculator
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

// 📍 POST /api/location/send-location
router.post("/send-location", verifyToken, async (req, res) => {
  const { latitude, longitude, timestamp } = req.body;
  const userId = req.user.userId; // ✅ Fixed from req.user.id

  try {
    const classes = await Class.find({ students: { $in: [userId] } });
    if (!classes.length) return res.status(404).json({ error: "Student not in any class" });

    const classObj = classes[0];
    const { classLat, classLng, radiusMeters = 50 } = classObj;
    
    // Handle case where class location is not set
    if (!classLat || !classLng) {
      return res.status(400).json({ error: "Class location not configured" });
    }

    const distance = calculateDistance(latitude, longitude, classLat, classLng);

    let status = "Present";
    const prevEntry = await StudentLocation.findOne({ studentId: userId }).sort({ timestamp: -1 });

    if (distance > radiusMeters) {
      status = (!prevEntry || ["Present", "Returned"].includes(prevEntry.status)) ? "Left" : prevEntry.status;
    } else if (prevEntry?.status === "Left") {
      status = "Returned";
    }

    await StudentLocation.create({
      studentId: userId,
      classId: classObj._id,
      latitude,
      longitude,
      timestamp: timestamp || new Date(),
      status,
    });

    res.json({ 
      message: "Location updated", 
      status, 
      distance: Math.round(distance),
      inRange: distance <= radiusMeters
    });
  } catch (err) {
    console.error("Error in /send-location:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 📊 GET /api/location/status/:studentId
router.get("/status/:studentId", verifyToken, async (req, res) => {
  const { studentId } = req.params;
  try {
    const logs = await StudentLocation.find({ studentId }).sort({ timestamp: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

// ✅ Simple update route for testing
router.post('/update', (req, res) => {
  const { studentId, lat, lng } = req.body;
  const classLat = 12.345; 
  const classLng = 78.901; 
  const radius = 100;
  const dist = calculateDistance(lat, lng, classLat, classLng);
  const status = dist <= radius ? 'Present' : 'Left';
  res.json({ status, distance: Math.round(dist) });
});

module.exports = router;