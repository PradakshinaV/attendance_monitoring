const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require('mongoose');

const userRoutes = require("./routes/userRoutes");
const classRoutes = require('./routes/classRoutes');
const locationRoutes = require("./routes/locationRoutes"); // ✅ only one
const authRoutes = require("./routes/authRoutes");
const connectDB = require("./config/db");

dotenv.config(); // Load environment variables first

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/user", userRoutes); // ✅ Add user CRUD routes

// Connect to DB using your function
connectDB(); // ✅ Proper way using config/db.js

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/class", classRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
