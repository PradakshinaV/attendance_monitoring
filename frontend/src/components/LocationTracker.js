import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { showNotification, requestNotificationPermission } from "./NotificationHelper";

function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371e3; // Earth radius in meters

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

function LocationTracker({ updateLogs = () => {}, locationPermission = true }) {
  const [status, setStatus] = useState("Waiting to send...");
  const [tracking, setTracking] = useState(false);

  const sendLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setStatus("❌ Geolocation not supported.");
      updateLogs("❌ Geolocation not supported", "Error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const token = localStorage.getItem("token");
        if (!token) {
          setStatus("❌ No token found.");
          updateLogs("❌ No token found", "Error");
          return;
        }

        const { latitude, longitude } = position.coords;

        try {
          await axios.post(
            "http://localhost:5000/api/location/send-location",
            {
              latitude,
              longitude,
              timestamp: new Date().toISOString(),
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const log = `✅ Location Sent: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setStatus(log);
          updateLogs(log, "Tracking");
        } catch (err) {
          console.error("Axios error:", err);
          setStatus("❌ Error sending location");
          updateLogs("❌ Error sending location", "Error");
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        setStatus("❌ Failed to get location");
        updateLogs("❌ Failed to get location", "Error");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [updateLogs]);

  useEffect(() => {
    if (!locationPermission) {
      updateLogs("📍 Location permission revoked", "Permission Denied");
      alert("❌ Location tracking stopped due to revoked permission.");
      setTracking(false);

      requestNotificationPermission().then((granted) => {
        if (granted) {
          showNotification("📍 Tracking Stopped", "Location permission was revoked.");
        }
      });

      return;
    }

    if ("geolocation" in navigator) {
      setTracking(true);
      const interval = setInterval(sendLocation, 2 * 60 * 1000); // every 2 minutes
      sendLocation(); // Initial send immediately
      return () => clearInterval(interval);
    } else {
      alert("❌ Geolocation not supported.");
    }
  }, [locationPermission, sendLocation, updateLogs]);

  return (
    <div>
      <h2>🧭 Location Tracker</h2>
      <p>Status: {status}</p>
      <button onClick={sendLocation}>📍 Send Location Now</button>
      <p>{tracking ? "✅ Tracking location..." : "❌ Not tracking."}</p>
    </div>
  );
}

export default LocationTracker;
