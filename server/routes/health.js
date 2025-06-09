const express = require("express")
const mongoose = require("mongoose")
const Customer = require("../models/Customer")
const User = require("../models/User")

const router = express.Router()

// Health check endpoint
router.get("/", async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
    const customerCount = await Customer.countDocuments()
    const userCount = await User.countDocuments()

    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        name: "MongoDB",
        customerCount,
        userCount,
      },
    })
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      error: error.message,
    })
  }
})

module.exports = router
