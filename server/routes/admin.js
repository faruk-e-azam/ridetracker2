const express = require("express")
const User = require("../models/User")
const Customer = require("../models/Customer")
const { authenticateToken, requireAdmin } = require("../middleware/auth")

const router = express.Router()

// Apply authentication and admin check to all admin routes
router.use(authenticateToken)
router.use(requireAdmin)

// Get all users (admin only)
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 })
    res.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    res.status(500).json({ message: "Error fetching users", error: error.message })
  }
})

// Get admin stats (admin only)
router.get("/stats", async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments()
    const totalUsers = await User.countDocuments()

    const earnings = await Customer.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          totalCost: { $sum: "$cost" },
          totalSave: { $sum: "$save" },
        },
      },
    ])

    const stats = {
      totalCustomers,
      totalUsers,
      totalAmount: earnings[0]?.totalAmount || 0,
      totalCost: earnings[0]?.totalCost || 0,
      totalSave: earnings[0]?.totalSave || 0,
      netProfit: (earnings[0]?.totalAmount || 0) - (earnings[0]?.totalCost || 0),
    }

    res.json(stats)
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    res.status(500).json({ message: "Error fetching stats", error: error.message })
  }
})

module.exports = router
