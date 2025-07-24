import React, { useState } from "react";

const allowedLatitude = 12.9716;  // Replace with your classroom latitude
const allowedLongitude = 77.5946; // Replace with your classroom longitude
const radiusThreshold = 0.05; // approx ~50 meters

function LocationTracker({ updateLogs }) {
  const [status, setStatus] = useState("Unknown");

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of earth in KM
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const checkLocation = () => {
    if (!navigator.geolocation) {
      setStatus("Geolocation not supported.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const distance = getDistance(
          latitude,
          longitude,
          allowedLatitude,
          allowedLongitude
        );

        const newStatus = distance <= radiusThreshold ? "Returned" : "Left";
        const logEntry = {
          status: newStatus,
          time: new Date().toLocaleTimeString(),
        };

        setStatus(newStatus);
        updateLogs((prevLogs) => [logEntry, ...prevLogs], newStatus);
      },
      () => setStatus("Location access denied.")
    );
  };

  return (
    <div>
      <h2>Student Dashboard</h2>
      <p>📍 Location Status: {status}</p>
      <button onClick={checkLocation}>Send Location Now</button>
    </div>
  );
}

export default LocationTracker;
