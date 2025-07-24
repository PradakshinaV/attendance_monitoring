const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const CLASSROOM_LAT = 12.9716;
const CLASSROOM_LON = 77.5946;
const ALLOWED_RADIUS_METERS = 50;

let userStatus = {
  lastStatus: "Present",
  lastLeftTime: null,
  lastReturnTime: null,
  lastSeen: null,
};

const logs = [];

function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRad = (val) => (val * Math.PI) / 180;
  const R = 6371e3;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ✅ Step 3: Location API with alert triggering
router.post("/send-location", verifyToken, (req, res) => {
  const { latitude, longitude } = req.body;
  const userId = req.user.id;

  const distance = calculateDistance(latitude, longitude, CLASSROOM_LAT, CLASSROOM_LON);
  const isInside = distance <= ALLOWED_RADIUS_METERS;
  const now = new Date();

  userStatus.lastSeen = now;

  if (!isInside) {
    if (userStatus.lastStatus !== "Left") {
      userStatus.lastStatus = "Left";
      userStatus.lastLeftTime = now;
      logs.push({ status: "Left", time: now.toLocaleTimeString() });

      // ✅ Trigger alert
      console.log(`🚨 ALERT: User ${userId} LEFT the classroom area at ${now.toLocaleTimeString()}`);

      // Here: you can send email, push, or SMS
      sendTeacherAlert(userId, "User left classroom area!");
    }
  } else {
    if (userStatus.lastStatus === "Left") {
      userStatus.lastStatus = "Returned";
      userStatus.lastReturnTime = now;
      logs.push({ status: "Returned", time: now.toLocaleTimeString() });
    } else {
      userStatus.lastStatus = "Present";
    }
  }

  return res.json({ status: userStatus.lastStatus, distance, logs });
});

router.get("/logs", (req, res) => {
  res.json({ logs, currentStatus: userStatus.lastStatus });
});

// ✅ Dummy alert function (Step 3 output)
function sendTeacherAlert(userId, message) {
  console.log(`📩 Notify TEACHER: ${message} [User ID: ${userId}]`);
  // Later: Replace this with real push/email
}

// ✅ Dummy middleware to decode JWT token
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, "secret-key"); // use proper env secret
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = router;
