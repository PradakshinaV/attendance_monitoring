const express = require("express");
const router = express.Router();
const logs = [];

let userStatus = {
  lastStatus: "Present",
  lastLeftTime: null,
  lastReturnTime: null,
  lastSeen: null
};

router.post("/send-location", (req, res) => {
  const { latitude, longitude } = req.body;

  const allowedLat = 12.9716;
  const allowedLon = 77.5946;
  const threshold = 0.0007;

  const now = new Date();
  const distance =
    Math.abs(latitude - allowedLat) + Math.abs(longitude - allowedLon);

  userStatus.lastSeen = now;

  if (distance < threshold) {
    if (userStatus.lastStatus === "Left") {
      userStatus.lastStatus = "Returned";
      userStatus.lastReturnTime = now;
      logs.push({ status: "Returned", time: now.toLocaleTimeString() });
    } else {
      userStatus.lastStatus = "Present";
    }
  } else {
    if (userStatus.lastStatus !== "Left") {
      userStatus.lastLeftTime = now;
      userStatus.lastStatus = "Left";
      logs.push({ status: "Left", time: now.toLocaleTimeString() });
    }
  }

  return res.json({ status: userStatus.lastStatus, logs });
});

router.get("/logs", (req, res) => {
  res.json({ logs, currentStatus: userStatus.lastStatus });
});

module.exports = router;
