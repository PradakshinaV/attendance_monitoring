// models/AttendanceLog.js
const mongoose = require("mongoose");
const AttendanceLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["Present", "Left", "Returned"], required: true },
  time: { type: Date, default: Date.now },
  latitude: Number,
  longitude: Number,
});
module.exports = mongoose.model("AttendanceLog", AttendanceLogSchema);
