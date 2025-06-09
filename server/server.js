const app = require("./app")
const { connectDB } = require("./database/connection")
const { initializeDefaultUsers } = require("./utils/initializeData")

const PORT = process.env.PORT || 5000

// Start server function
async function startServer() {
  try {
    // Connect to database first
    await connectDB()

    // Initialize default users after connection is established
    await initializeDefaultUsers()

    // Start the server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`)
      console.log(`💾 Database: MongoDB`)
      console.log(`🔗 Test the API: http://localhost:${PORT}/health`)
      console.log("🔐 Authentication endpoints added!")
      console.log("👤 Default users created (check console for credentials)")
    })

    // Server timeout configurations
    server.setTimeout(120000)
    server.keepAliveTimeout = 120000
    server.headersTimeout = 120000
  } catch (error) {
    console.error("❌ Failed to start server:", error)
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🔄 Shutting down gracefully...")
  const { disconnectDB } = require("./database/connection")
  await disconnectDB()
  process.exit(0)
})

process.on("SIGTERM", async () => {
  console.log("\n🔄 Shutting down gracefully...")
  const { disconnectDB } = require("./database/connection")
  await disconnectDB()
  process.exit(0)
})

// Start the server
startServer()
