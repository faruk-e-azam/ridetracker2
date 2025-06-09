const mongoose = require("mongoose")

// Updated connection options with better error handling
const connectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000, // Increased timeout for Atlas
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  maxPoolSize: 10, // Maintain up to 10 socket connections
  minPoolSize: 5, // Maintain a minimum of 5 socket connections
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
}

let isConnected = false

const connectDB = async () => {
  if (isConnected) {
    console.log("✅ Using existing MongoDB connection")
    return
  }

  try {
    console.log("🔄 Connecting to MongoDB Atlas...")

    // Check if MONGODB_URI is defined
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not defined")
    }

    // Log connection attempt (without showing credentials)
    const sanitizedUri = process.env.MONGODB_URI.replace(/\/\/.*@/, "//***:***@")
    console.log(`🔗 Attempting to connect to: ${sanitizedUri}`)

    const conn = await mongoose.connect(process.env.MONGODB_URI, connectionOptions)

    isConnected = true
    console.log("✅ Connected to MongoDB Atlas successfully")
    console.log(`💾 Database: ${conn.connection.name}`)
    console.log(`🌐 Host: ${conn.connection.host}`)

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err.message)
      isConnected = false
    })

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ MongoDB disconnected")
      isConnected = false
    })

    mongoose.connection.on("reconnected", () => {
      console.log("✅ MongoDB reconnected")
      isConnected = true
    })

    return conn
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error.message)

    // Provide helpful error messages
    if (error.message.includes("IP")) {
      console.log("")
      console.log("🔧 IP Whitelist Fix:")
      console.log("1. Go to https://cloud.mongodb.com")
      console.log("2. Navigate to 'Network Access'")
      console.log("3. Click 'Add IP Address'")
      console.log("4. Click 'Add Current IP Address'")
      console.log("5. Wait 1-2 minutes for changes to apply")
      console.log("")
    }

    if (error.message.includes("authentication")) {
      console.log("")
      console.log("🔧 Authentication Fix:")
      console.log("1. Check your username and password in the connection string")
      console.log("2. Make sure the database user has proper permissions")
      console.log("")
    }

    isConnected = false
    throw error
  }
}

const disconnectDB = async () => {
  if (!isConnected) {
    return
  }

  try {
    await mongoose.disconnect()
    isConnected = false
    console.log("✅ Disconnected from MongoDB")
  } catch (error) {
    console.error("❌ Error disconnecting from MongoDB:", error)
  }
}

const getConnectionStatus = () => {
  return {
    isConnected,
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    name: mongoose.connection.name,
  }
}

module.exports = {
  connectDB,
  disconnectDB,
  getConnectionStatus,
  isConnected: () => isConnected,
}
