const mongoose = require("mongoose")

// Updated connection options compatible with newer MongoDB driver versions
const connectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  // Removed: bufferCommands: false,
  // Removed: bufferMaxEntries: 0,
}

let isConnected = false

const connectDB = async () => {
  if (isConnected) {
    console.log("✅ Using existing MongoDB connection")
    return
  }

  try {
    console.log("🔄 Connecting to MongoDB...")

    // Check if MONGODB_URI is defined
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not defined")
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, connectionOptions)

    isConnected = true
    console.log("✅ Connected to MongoDB successfully")
    console.log(`💾 Database: ${conn.connection.name}`)

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err)
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
