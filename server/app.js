const express = require("express")
const cors = require("cors")
require("dotenv").config()

// Import routes
const authRoutes = require("./routes/auth")
const customerRoutes = require("./routes/customers")
const adminRoutes = require("./routes/admin")
const healthRoutes = require("./routes/health")

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/customer", customerRoutes)
app.use("/api/customers", customerRoutes) // Alternative endpoint
app.use("/api/admin", adminRoutes)
app.use("/health", healthRoutes)

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
  console.error("❌ Server Error:", err.stack)
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
  })
})

module.exports = app
