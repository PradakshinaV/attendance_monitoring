// src/components/SendLocation.js
import React from "react";

function SendLocation() {
  const sendLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetch("http://localhost:5000/api/location/send-location", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer YOUR_JWT_TOKEN", // 🔐 Replace with actual token if using auth
          },
          body: JSON.stringify({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: new Date().toISOString(),
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            alert(data.message || "Location sent successfully!");
          })
          .catch((err) => {
            console.error(err);
            alert("Failed to send location");
          });
      },
      (err) => {
        alert("Geolocation permission denied or not available.");
      }
    );
  };

  return <button onClick={sendLocation}>📍 Send Attendance Location</button>;
}

export default SendLocation;
