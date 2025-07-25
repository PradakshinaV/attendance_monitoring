// models/Class.js - FIXED VERSION
const mongoose = require("mongoose");

const ClassSchema = new mongoose.Schema({
  className: { type: String, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // ✅ Fixed
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // ✅ Fixed
  classLat: Number,
  classLng: Number,
  radiusMeters: {
    type: Number,
    default: 50,
  },
}, { timestamps: true });

module.exports = mongoose.model("Class", ClassSchema);