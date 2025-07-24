// routes/locationRoutes.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const AttendanceLog = require("../models/AttendanceLog"); // ✅ Import

// Geofence center (your classroom location)
const CENTER_LAT = 12.9716;
const CENTER_LNG = 77.5946;
const RADIUS_METERS = 50; // ~50 meters

// Utility: Calculate distance between 2 coordinates
function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth’s radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Token verification middleware
const verifyToken = (req, res, next) => {
  const token = req.body.token || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Invalid or expired token" });
  }
};

router.post("/send-location", verifyToken, async (req, res) => {
  const { latitude, longitude } = req.body;
  const userId = req.user.userId;

  const distance = getDistanceFromLatLonInMeters(
    latitude,
    longitude,
    CENTER_LAT,
    CENTER_LNG
  );

  const status = distance <= RADIUS_METERS ? "Present" : "Left";

  try {
    // ✅ Save to DB
    await AttendanceLog.create({
      userId,
      status,
      latitude,
      longitude
    });

    console.log(
      `📍 User ${userId} is ${status} (Distance: ${distance.toFixed(2)}m) at ${new Date().toLocaleTimeString()}`
    );

    return res.json({ status, distance: Math.round(distance) });
  } catch (error) {
    return res.status(500).json({ msg: "Error saving attendance", error });
  }
});

module.exports = router;
