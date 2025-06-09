const bcrypt = require("bcrypt")
const User = require("../models/User")

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

module.exports = { initializeDefaultUsers }
