const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

// Geofence center (your classroom location)
const CENTER_LAT = 12.9716;
const CENTER_LNG = 77.5946;
const RADIUS_METERS = 50; // ~50 meters radius

// Utility: Calculate distance between 2 lat/lng in meters
function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

router.post("/send-location", async (req, res) => {
  const { token, latitude, longitude } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const distance = getDistanceFromLatLonInMeters(
      latitude,
      longitude,
      CENTER_LAT,
      CENTER_LNG
    );

    let status = "Left";
    if (distance <= RADIUS_METERS) {
      status = "Present";
    }

    // TODO: Save attendance status in DB (optional now)
    console.log(`User ${userId} is ${status} at ${new Date().toLocaleTimeString()}`);

    return res.json({ status });
  } catch (err) {
    return res.status(401).json({ msg: "Invalid token" });
  }
});

module.exports = router;
