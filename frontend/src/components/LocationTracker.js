import { useEffect, useState } from "react";

function LocationTracker({ updateLogs, locationPermission }) {
  const [status, setStatus] = useState('Requesting location...');
  const [error, setError] = useState('');
  const [boundaryInfo, setBoundaryInfo] = useState({
    isWithinBoundary: true,
    distanceFromClass: 0,
    boundaryStatus: 'inside',
    outsideDuration: 0
  });

  useEffect(() => {
    if (!locationPermission) {
      setStatus('Location permission revoked');
      return;
    }

    const trackLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = position.coords.accuracy;

          // Get token from localStorage
          const token = localStorage.getItem('token');
          
          if (!token) {
            setError('Please log in to track location');
            setStatus('Authentication required');
            return;
          }

          // Send location to backend with enhanced data
          fetch("http://localhost:5000/api/location/send-location", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              latitude: lat,
              longitude: lng,
              accuracy: accuracy,
              timestamp: new Date().toISOString()
            })
          })
            .then(res => {
              if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
              }
              return res.json();
            })
            .then((data) => {
              if (data.error) {
                setError(data.error);
                setStatus('Error: ' + data.error);
              } else {
                // Update boundary information using backend response
                setBoundaryInfo({
                  isWithinBoundary: data.isWithinBoundary || data.inRange || true,
                  distanceFromClass: data.distanceFromClass || data.distance || 0,
                  boundaryStatus: data.boundaryStatus || 'inside',
                  outsideDuration: data.outsideDuration || 0
                });

                // Set status based on boundary status
                let statusMessage = "Location sent successfully";
                if (data.boundaryStatus === 'just_left') {
                  statusMessage = "⚠️ Just left classroom boundary";
                } else if (data.boundaryStatus === 'outside') {
                  statusMessage = `🚨 Outside classroom (${data.distanceFromClass || data.distance}m away)`;
                } else if (data.boundaryStatus === 'long_absence') {
                  statusMessage = `🚨 ALERT: Outside for ${data.outsideDuration}+ minutes - Staff notified!`;
                } else if (data.boundaryStatus === 'inside') {
                  statusMessage = "✅ Inside classroom";
                }

                setStatus(statusMessage);
                setError('');
                
                // Update parent component with enhanced data
                if (updateLogs) {
                  updateLogs({
                    status: statusMessage,
                    time: new Date().toLocaleTimeString(),
                    distance: data.distanceFromClass || data.distance,
                    isWithinBoundary: data.isWithinBoundary || data.inRange,
                    boundaryStatus: data.boundaryStatus || 'inside',
                    outsideDuration: data.outsideDuration || 0,
                    alert: data.alertTriggered || false
                  }, data.boundaryStatus || 'inside');
                }
              }
            })
            .catch((err) => {
              console.error("Location send error:", err);
              if (err.message.includes('401')) {
                setError("Authentication failed - please log in again");
                setStatus("Authentication required");
                localStorage.removeItem('token'); // Clear invalid token
              } else if (err.message.includes('403')) {
                setError("Access denied - insufficient permissions");
                setStatus("Access denied");
              } else if (err.message.includes('404')) {
                setError("You are not enrolled in any class");
                setStatus("No class enrollment");
              } else {
                setError("Failed to send location: " + err.message);
                setStatus("Connection error");
              }
            });
        },
        (err) => {
          console.error("Geolocation error:", err);
          let errorMessage = "Location access error";
          
          switch(err.code) {
            case err.PERMISSION_DENIED:
              errorMessage = "Location permission denied by user";
              break;
            case err.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable";
              break;
            case err.TIMEOUT:
              errorMessage = "Location request timed out";
              break;
            default:
              errorMessage = "Unknown location error";
              break;
          }
          
          setError(errorMessage);
          setStatus("Location access denied");
        },
        {
          enableHighAccuracy: true,
          timeout: 15000, // Increased timeout
          maximumAge: 30000
        }
      );
    };

    // Track immediately and then every 30 seconds
    trackLocation();
    const interval = setInterval(trackLocation, 30000);

    return () => clearInterval(interval);
  }, [locationPermission, updateLogs]);

  // Get status color based on boundary status
  const getStatusColor = () => {
    switch (boundaryInfo.boundaryStatus) {
      case 'inside':
        return '#4CAF50'; // Green
      case 'just_left':
        return '#FF9800'; // Orange
      case 'outside':
        return '#FF5722'; // Red-Orange
      case 'long_absence':
        return '#F44336'; // Red
      default:
        return '#757575'; // Gray
    }
  };

  // Get boundary status icon
  const getStatusIcon = () => {
    switch (boundaryInfo.boundaryStatus) {
      case 'inside':
        return '✅';
      case 'just_left':
        return '⚠️';
      case 'outside':
        return '🚨';
      case 'long_absence':
        return '🚨';
      default:
        return '📍';
    }
  };

  return (
    <div style={{ 
      padding: "10px", 
      border: `2px solid ${getStatusColor()}`, 
      borderRadius: "8px", 
      margin: "10px 0",
      backgroundColor: boundaryInfo.boundaryStatus === 'long_absence' ? '#ffebee' : '#f9f9f9'
    }}>
      <p>
        {getStatusIcon()} <strong>Tracking Status:</strong> 
        <span style={{ color: getStatusColor(), fontWeight: 'bold', marginLeft: '5px' }}>
          {status}
        </span>
      </p>
      
      {/* Boundary Information */}
      <div style={{ margin: '8px 0', padding: '8px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
        <p style={{ margin: '2px 0', fontSize: '14px' }}>
          <strong>Distance from Class:</strong> 
          <span style={{ color: boundaryInfo.isWithinBoundary ? '#4CAF50' : '#FF5722' }}>
            {' '}{boundaryInfo.distanceFromClass.toFixed(1)}m
          </span>
          {boundaryInfo.isWithinBoundary ? ' (Inside boundary)' : ' (Outside boundary)'}
        </p>
        
        {!boundaryInfo.isWithinBoundary && boundaryInfo.outsideDuration > 0 && (
          <p style={{ margin: '2px 0', fontSize: '14px' }}>
            <strong>Time Outside:</strong> 
            <span style={{ 
              color: boundaryInfo.outsideDuration >= 5 ? '#F44336' : '#FF9800',
              fontWeight: 'bold'
            }}>
              {' '}{boundaryInfo.outsideDuration.toFixed(1)} minutes
            </span>
            {boundaryInfo.outsideDuration >= 5 && ' - Staff Notified!'}
          </p>
        )}
      </div>

      {error && (
        <p style={{ color: '#F44336', fontWeight: 'bold', margin: '5px 0' }}>
          ❌ {error}
        </p>
      )}
      
      <small style={{ color: '#666' }}>🔄 Updates every 30 seconds</small>
      
      {/* Alert for long absence */}
      {boundaryInfo.boundaryStatus === 'long_absence' && (
        <div style={{
          marginTop: '10px',
          padding: '10px',
          backgroundColor: '#ffcdd2',
          border: '1px solid #f44336',
          borderRadius: '4px',
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#d32f2f'
        }}>
          🚨 ALERT: You have been outside the classroom for more than 5 minutes. 
          Staff have been automatically notified of your location.
        </div>
      )}
    </div>
  );
}

export default LocationTracker;