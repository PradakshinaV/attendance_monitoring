const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
  status: { type: String, enum: ["Present", "Left", "Returned"] },
  timestamp: { type: Date, default: Date.now },
  location: {
    latitude: Number,
    longitude: Number
  }
});

module.exports = mongoose.model("Attendance", attendanceSchema);
