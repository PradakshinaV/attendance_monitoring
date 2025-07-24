const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const mongoose = require('mongoose');

const classRoutes = require('./routes/classRoutes');
const locationRoutes = require("./routes/location");

mongoose.connect('mongodb://localhost:27017/attendanceDB');

mongoose.connect('mongodb://localhost:27017/classroom', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/location", require("./routes/locationRoutes"));

app.use('/api/class', classRoutes);

app.use("/api/location", locationRoutes);
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
