// models/StudentLocation.js - Enhanced with boundary tracking
const mongoose = require("mongoose");

const StudentLocationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // or whatever your student model is
    required: true,
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
  },
  
  // Current location data
  latitude: Number,
  longitude: Number,
  timestamp: Date,
  
  // Enhanced status tracking
  status: {
    type: String,
    enum: ["Present", "Left", "Returned", "Outside_Boundary", "Long_Absence"],
    default: "Present"
  },
  
  // Classroom boundary settings
  classroomBoundary: {
    center: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    radius: { type: Number, default: 50 } // 50 meters default
  },
  
  // Boundary tracking data
  boundaryStatus: {
    type: String,
    enum: ["inside", "outside", "just_left", "long_absence"],
    default: "inside"
  },
  
  // Track when student goes outside boundary
  outsideBoundarySession: {
    startTime: Date,
    endTime: Date,
    duration: Number, // in minutes
    maxDistance: Number, // maximum distance reached
    alertSent: { type: Boolean, default: false },
    staffNotified: { type: Boolean, default: false }
  },
  
  // Distance from classroom
  distanceFromClass: { type: Number, default: 0 },
  isWithinBoundary: { type: Boolean, default: true },
  
  // Location history (keep last 50 points)
  locationHistory: [{
    latitude: Number,
    longitude: Number,
    timestamp: { type: Date, default: Date.now },
    distanceFromClass: Number,
    isWithinBoundary: Boolean,
    _id: false // Don't create _id for subdocuments
  }],
  
  // Alerts for staff
  alerts: [{
    type: {
      type: String,
      enum: ["outside_boundary_5min", "returned_to_class", "far_from_class"]
    },
    timestamp: { type: Date, default: Date.now },
    location: { lat: Number, lng: Number },
    distance: Number,
    message: String,
    staffNotified: { type: Boolean, default: false },
    resolved: { type: Boolean, default: false },
    _id: false
  }],
  
  // Last update timestamp
  lastUpdate: { type: Date, default: Date.now }
}, {
  timestamps: true // This adds createdAt and updatedAt automatically
});

// Index for better performance
StudentLocationSchema.index({ studentId: 1, classId: 1 });
StudentLocationSchema.index({ boundaryStatus: 1 });
StudentLocationSchema.index({ lastUpdate: -1 });

// Method to calculate distance from classroom
StudentLocationSchema.methods.calculateDistanceFromClass = function() {
  if (!this.latitude || !this.longitude || !this.classroomBoundary.center.lat || !this.classroomBoundary.center.lng) {
    return 0;
  }
  
  const R = 6371e3; // Earth's radius in meters
  const φ1 = this.classroomBoundary.center.lat * Math.PI/180;
  const φ2 = this.latitude * Math.PI/180;
  const Δφ = (this.latitude - this.classroomBoundary.center.lat) * Math.PI/180;
  const Δλ = (this.longitude - this.classroomBoundary.center.lng) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
};

// Method to get current outside duration
StudentLocationSchema.methods.getOutsideDuration = function() {
  if (!this.outsideBoundarySession || !this.outsideBoundarySession.startTime) {
    return 0;
  }
  
  const endTime = this.outsideBoundarySession.endTime || new Date();
  return (endTime - this.outsideBoundarySession.startTime) / (1000 * 60); // minutes
};

// Pre-save middleware to update location data
StudentLocationSchema.pre('save', function(next) {
  if (this.latitude && this.longitude) {
    this.distanceFromClass = this.calculateDistanceFromClass();
    this.isWithinBoundary = this.distanceFromClass <= this.classroomBoundary.radius;
    this.lastUpdate = new Date();
    
    // Add to location history
    this.locationHistory.push({
      latitude: this.latitude,
      longitude: this.longitude,
      timestamp: new Date(),
      distanceFromClass: this.distanceFromClass,
      isWithinBoundary: this.isWithinBoundary
    });
    
    // Keep only last 50 location points
    if (this.locationHistory.length > 50) {
      this.locationHistory = this.locationHistory.slice(-50);
    }
  }
  next();
});

module.exports = mongoose.model("StudentLocation", StudentLocationSchema);