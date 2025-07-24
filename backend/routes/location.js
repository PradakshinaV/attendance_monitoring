const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/verifyToken"); // externalized
require("dotenv").config();

// Constants
const CLASSROOM_LAT = 12.9716;
const CLASSROOM_LON = 77.5946;
const ALLOWED_RADIUS_METERS = 50;

// Per-user status tracking
const userStatusMap = {}; // userId → status object
const userLogsMap = {};   // userId → logs array

// Distance Calculation (Haversine)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRad = (val) => (val * Math.PI) / 180;
  const R = 6371e3;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Location API
router.post("/send-location", verifyToken, (req, res) => {
  const { latitude, longitude } = req.body;
  const userId = req.user.id;
  const distance = calculateDistance(latitude, longitude, CLASSROOM_LAT, CLASSROOM_LON);
  const isInside = distance <= ALLOWED_RADIUS_METERS;
  const now = new Date();

  if (!userStatusMap[userId]) {
    userStatusMap[userId] = {
      lastStatus: "Present",
      lastLeftTime: null,
      lastReturnTime: null,
      lastSeen: now
    };
    userLogsMap[userId] = [];
  }

  const userStatus = userStatusMap[userId];
  const userLogs = userLogsMap[userId];
  userStatus.lastSeen = now;

  if (!isInside) {
    if (userStatus.lastStatus !== "Left") {
      userStatus.lastStatus = "Left";
      userStatus.lastLeftTime = now;
      userLogs.push({ status: "Left", time: now.toLocaleTimeString() });
      console.log(`🚨 ALERT: User ${userId} LEFT the classroom at ${now.toLocaleTimeString()}`);
      sendTeacherAlert(userId, "User left classroom area!");
    }
  } else {
    if (userStatus.lastStatus === "Left") {
      userStatus.lastStatus = "Returned";
      userStatus.lastReturnTime = now;
      userLogs.push({ status: "Returned", time: now.toLocaleTimeString() });
    } else {
      userStatus.lastStatus = "Present";
    }
  }

  return res.json({
    userId,
    status: userStatus.lastStatus,
    distance,
    logs: userLogs
  });
});

// Get logs per user (maybe restrict to teachers/admin)
router.get("/logs/:userId", verifyToken, (req, res) => {
  const { userId } = req.params;
  res.json({
    logs: userLogsMap[userId] || [],
    currentStatus: userStatusMap[userId]?.lastStatus || "Unknown"
  });
});

// Alert Simulation
function sendTeacherAlert(userId, message) {
  console.log(`📩 Notify TEACHER: ${message} [User ID: ${userId}]`);
}

module.exports = router;
