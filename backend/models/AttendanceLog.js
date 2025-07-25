const mongoose = require("mongoose");

const attendanceLogSchema = new mongoose.Schema({
  userId: String,
  status: String,
  latitude: Number,
  longitude: Number,
  time: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("AttendanceLog", attendanceLogSchema);
