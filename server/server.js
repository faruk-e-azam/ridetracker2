const cors = require("cors")
const express = require("express")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require("dotenv").config()

const app = express()
const PORT = 5000

// Middleware
app.use(cors())
app.use(express.json())

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/customer_dashboard"

// Connect to MongoDB - using the new connection approach
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB successfully"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err)
    process.exit(1)
  })

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production"

// User Schema for Authentication
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["admin", "customer"],
      default: "customer",
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true }
)

// Customer Schema (existing)
const customerSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    cost: {
      type: Number,
      default: 0,
    },
    save: {
      type: Number,
      default: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

// Create models
const User = mongoose.model("User", userSchema)
const Customer = mongoose.model("Customer", customerSchema)

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ message: "Access token required" })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" })
    }
    req.user = user
    next()
  })
}

// Initialize default users
const initializeDefaultUsers = async () => {
  try {
    const adminExists = await User.findOne({ username: "admin" })
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin123", 10)
      const admin = new User({
        username: "admin",
        password: hashedPassword,
        role: "admin",
        fullName: "Administrator",
      })
      await admin.save()
      console.log("✅ Default admin user created (username: admin, password: admin123)")
    }

    const customerExists = await User.findOne({ username: "customer" })
    if (!customerExists) {
      const hashedPassword = await bcrypt.hash("customer123", 10)
      const customer = new User({
        username: "customer",
        password: hashedPassword,
        role: "customer",
        fullName: "Demo Customer",
      })
      await customer.save()
      console.log("✅ Default customer user created (username: customer, password: customer123)")
    }
  } catch (error) {
    console.error("❌ Error initializing default users:", error)
  }
}

// AUTH ROUTES

// Register endpoint
app.post("/api/auth/register", async (req, res) => {
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
app.post("/api/auth/login", async (req, res) => {
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
      { expiresIn: "24h" }
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
app.post("/api/auth/change-password", authenticateToken, async (req, res) => {
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
app.get("/api/auth/profile", authenticateToken, async (req, res) => {
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

// EXISTING CUSTOMER ROUTES

// GET all customers - updated to support sorting
app.get("/api/customer", async (req, res) => {
  try {
    const { sort = "-createdAt" } = req.query // Default to newest first

    const customers = await Customer.find().sort(sort)
    console.log(`Fetched ${customers.length} customers`)
    res.json(customers)
  } catch (error) {
    console.error("Error fetching customers:", error)
    res.status(500).json({ message: "Error fetching customers", error: error.message })
  }
})

// POST create new customer - completely rewritten
app.post("/api/customer", async (req, res) => {
  try {
    console.log("Received data:", req.body)

    // Extract data from request
    const { customerName, contactNumber, location, amount, cost, save, date } = req.body

    // Validate required fields
    if (!customerName || !location || !amount) {
      return res.status(400).json({
        message: "Missing required fields: customerName, location, and amount are required",
      })
    }

    // Create document directly
    const result = await Customer.create({
      customerName: customerName.trim(),
      contactNumber: contactNumber ? contactNumber.trim() : "",
      location: location.trim(),
      amount: Number(amount) || 0,
      cost: Number(cost) || 0,
      save: Number(save) || 0,
      date: date ? new Date(date) : new Date(),
    })

    console.log("Created customer:", result)
    res.status(201).json(result)
  } catch (error) {
    console.error("Error creating customer:", error)
    res.status(500).json({ message: "Error creating customer", error: error.message })
  }
})

// GET customer by ID
app.get("/api/customer/:id", async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
    if (!customer) return res.status(404).json({ message: "Customer not found" })
    res.json(customer)
  } catch (error) {
    console.error("Error fetching customer:", error)
    res.status(500).json({ message: "Error fetching customer", error: error.message })
  }
})

// PUT update customer
app.put("/api/customer/:id", async (req, res) => {
  try {
    const { customerName, contactNumber, location, amount, cost, save, date } = req.body

    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        customerName: customerName ? customerName.trim() : undefined,
        contactNumber: contactNumber ? contactNumber.trim() : "",
        location: location ? location.trim() : undefined,
        amount: amount ? Number(amount) : undefined,
        cost: cost ? Number(cost) : 0,
        save: save ? Number(save) : 0,
        date: date ? new Date(date) : undefined,
      },
      { new: true, runValidators: true }
    )

    if (!updatedCustomer) return res.status(404).json({ message: "Customer not found" })
    res.json(updatedCustomer)
  } catch (error) {
    console.error("Error updating customer:", error)
    res.status(500).json({ message: "Error updating customer", error: error.message })
  }
})

// DELETE customer
app.delete("/api/customer/:id", async (req, res) => {
  try {
    const deletedCustomer = await Customer.findByIdAndDelete(req.params.id)
    if (!deletedCustomer) return res.status(404).json({ message: "Customer not found" })
    res.json({ message: "Customer deleted successfully", customer: deletedCustomer })
  } catch (error) {
    console.error("Error deleting customer:", error)
    res.status(500).json({ message: "Error deleting customer", error: error.message })
  }
})

// GET totals endpoint
app.get("/api/customers/totals", async (req, res) => {
  try {
    const result = await Customer.aggregate([
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          totalIncome: { $sum: "$amount" },
          totalCost: { $sum: "$cost" },
          totalSave: { $sum: "$save" },
        },
      },
    ])

    const totals =
      result.length > 0
        ? result[0]
        : {
            totalCustomers: 0,
            totalIncome: 0,
            totalCost: 0,
            totalSave: 0,
          }

    // Remove _id from response
    if (totals._id !== undefined) {
      delete totals._id
    }

    res.json(totals)
  } catch (error) {
    console.error("Error calculating totals:", error)
    res.status(500).json({ message: "Error calculating totals", error: error.message })
  }
})

// ADMIN ROUTES (Protected)

// Get all users (admin only)
app.get("/api/admin/users", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" })
    }

    const users = await User.find().select("-password").sort({ createdAt: -1 })
    res.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    res.status(500).json({ message: "Error fetching users", error: error.message })
  }
})

// Get admin stats (admin only)
app.get("/api/admin/stats", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" })
    }

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

// Health check endpoint
app.get("/health", async (req, res) => {
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

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Customer Dashboard API with MongoDB & Authentication",
    version: "3.0.0",
    endpoints: {
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        profile: "GET /api/auth/profile",
        changePassword: "POST /api/auth/change-password",
      },
      customers: {
        list: "GET /api/customer",
        create: "POST /api/customer",
        get: "GET /api/customer/:id",
        update: "PUT /api/customer/:id",
        delete: "DELETE /api/customer/:id",
        totals: "GET /api/customers/totals",
      },
      admin: {
        users: "GET /api/admin/users",
        stats: "GET /api/admin/stats",
      },
      health: "GET /health",
    },
    features: [
      "User Authentication & Authorization",
      "JWT Token-based Security",
      "Role-based Access Control",
      "Contact Number Support",
      "CRUD Operations",
      "Data Aggregation",
    ],
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: "Something went wrong!" })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" })
})

// Initialize default users and start server
initializeDefaultUsers().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`)
    console.log(`💾 Database: MongoDB (${MONGODB_URI})`)
    console.log("🔗 Test the API: http://localhost:5000/health")
    console.log("🔐 Authentication endpoints added!")
    console.log("👤 Default users created (check console for credentials)")
  })
})
