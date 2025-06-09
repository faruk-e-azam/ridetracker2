const express = require("express")
const Customer = require("../models/Customer")

const router = express.Router()

// GET all customers - updated to support sorting
router.get("/", async (req, res) => {
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

// POST create new customer
router.post("/", async (req, res) => {
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
router.get("/:id", async (req, res) => {
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
router.put("/:id", async (req, res) => {
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
      { new: true, runValidators: true },
    )

    if (!updatedCustomer) return res.status(404).json({ message: "Customer not found" })
    res.json(updatedCustomer)
  } catch (error) {
    console.error("Error updating customer:", error)
    res.status(500).json({ message: "Error updating customer", error: error.message })
  }
})

// DELETE customer
router.delete("/:id", async (req, res) => {
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
router.get("/totals", async (req, res) => {
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

module.exports = router
