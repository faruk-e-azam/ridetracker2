const mongoose = require("mongoose")

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
  {
    timestamps: true,
    suppressReservedKeysWarning: true,
  },
)

module.exports = mongoose.model("Customer", customerSchema)
