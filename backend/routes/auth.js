const express = require("express");
const router = express.Router();

const authController = require("backend\controllers\authcontroller.js");
const verifyToken = require("../middleware/verifyToken");

// 🔐 Authentication Routes
router.post("/signup", authController.signup);                        // User registration
router.post("/login", authController.login);                          // User login
router.get("/profile", verifyToken, authController.getProfile);       // Protected route
router.put("/profile", verifyToken, authController.updateProfile);    // Update user

module.exports = router;
