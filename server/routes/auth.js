const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const { authenticateToken, JWT_SECRET } = require("../middleware/auth")

const router = express.Router()

// Register endpoint
router.post("/register", async (req, res) => {
  try {
    const { username, password, role = "customer", email, fullName } = req.body

    // Validation
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" })
    }

    if (username.length < 3) {
      return res.status(400).json({ message: "Username must be at least 3 characters long" })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username })
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user
    const user = new User({
      username: username.trim(),
      password: hashedPassword,
      role,
      email: email ? email.trim() : undefined,
      fullName: fullName ? fullName.trim() : undefined,
    })

    await user.save()

    console.log(`✅ New user registered: ${username} (${role})`)

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        fullName: user.fullName,
        email: user.email,
      },
    })
  } catch (error) {
    console.error("❌ Registration error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" })
    }

    // Find user in database
    const user = await User.findOne({ username, isActive: true })
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    )

    console.log(`✅ User logged in: ${username} (${user.role})`)

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        fullName: user.fullName,
        email: user.email,
      },
    })
  } catch (error) {
    console.error("❌ Login error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

// Change password endpoint
router.post("/change-password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" })
    }

    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ message: "Current password is incorrect" })
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10)
    user.password = hashedNewPassword
    await user.save()

    console.log(`✅ Password changed for user: ${user.username}`)

    res.json({ message: "Password changed successfully" })
  } catch (error) {
    console.error("❌ Change password error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

// Get user profile endpoint
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        fullName: user.fullName,
        email: user.email,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error("❌ Profile fetch error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

module.exports = router
