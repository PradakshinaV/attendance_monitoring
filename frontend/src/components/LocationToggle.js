import React, { useState } from "react";

function LocationToggle({ onPermissionChange }) {
  const [permission, setPermission] = useState(true);

  const togglePermission = () => {
    const newPermission = !permission;
    setPermission(newPermission);
    onPermissionChange(newPermission);
  };

  return (
    <div className="location-toggle">
      <p>Location Permission: {permission ? "Granted" : "Revoked"}</p>
      <button onClick={togglePermission}>
        {permission ? "Revoke Permission" : "Grant Permission"}
      </button>
    </div>
  );
}

export default LocationToggle;
