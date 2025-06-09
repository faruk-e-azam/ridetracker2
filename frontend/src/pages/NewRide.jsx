"use client"

import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import "../styles/ride-form.css"

const NewRide = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [formData, setFormData] = useState({
    customerName: "",
    contactNumber: "",
    fromLocation: "",
    toLocation: "",
    amount: "",
    date: "",
    cost: "",
    save: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [showSuccess, setShowSuccess] = useState(false)
  const [apiError, setApiError] = useState("")

  // Check if this is a quick ride and prefill data
  useEffect(() => {
    if (location.state && location.state.prefillData) {
      setFormData(location.state.prefillData)
    }
  }, [location.state])

  const validateField = (name, value) => {
    const newErrors = { ...errors }

    switch (name) {
      case "customerName":
        if (value.length < 2) {
          newErrors.customerName = "Name must be at least 2 characters"
        } else {
          delete newErrors.customerName
        }
        break
      case "contactNumber":
        const phoneRegex = /^[0-9+\-\s()]{10,15}$/
        if (value && !phoneRegex.test(value.replace(/\s/g, ""))) {
          newErrors.contactNumber = "Please enter a valid contact number"
        } else {
          delete newErrors.contactNumber
        }
        break
      case "fromLocation":
        if (value.length < 2) {
          newErrors.fromLocation = "From location must be at least 2 characters"
        } else {
          delete newErrors.fromLocation
        }
        break
      case "toLocation":
        if (value.length < 2) {
          newErrors.toLocation = "To location must be at least 2 characters"
        } else {
          delete newErrors.toLocation
        }
        break
      case "amount":
        if (Number.parseFloat(value) <= 0) {
          newErrors.amount = "Amount must be greater than 0"
        } else {
          delete newErrors.amount
        }
        break
      case "cost":
        if (value && Number.parseFloat(value) <= 0) {
          newErrors.cost = "Cost must be greater than 0"
        } else {
          delete newErrors.cost
        }
        break
      case "save":
        if (value && Number.parseFloat(value) < 0) {
          newErrors.save = "Save amount cannot be negative"
        } else {
          delete newErrors.save
        }
        break
      case "date":
        const selectedDate = new Date(value)
        const today = new Date()
        if (selectedDate > today) {
          newErrors.date = "Date cannot be in the future"
        } else {
          delete newErrors.date
        }
        break
      default:
        break
    }

    setErrors(newErrors)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    validateField(name, value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setApiError("")

    try {
      const submitData = {
        customerName: formData.customerName.trim(),
        contactNumber: formData.contactNumber.trim(),
        location: `${formData.fromLocation} → ${formData.toLocation}`,
        amount: Number.parseFloat(formData.amount),
        cost: Number.parseFloat(formData.cost) || 0,
        save: Number.parseFloat(formData.save) || 0,
        date: formData.date,
      }

      const response = await fetch(`http://localhost:5000/api/customer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to submit form")
      }

      setShowSuccess(true)
      setTimeout(() => {
        navigate("/dashboard")
      }, 2000)
    } catch (error) {
      setApiError(error.message || "Failed to submit form. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (showSuccess) {
    return (
      <div className="success-container">
        <div className="success-card">
          <div className="success-icon">✅</div>
          <h2>Success!</h2>
          <p>Customer entry has been saved successfully!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="new-ride-container">
      <div className="new-ride-card">
        <div className="new-ride-header">
          <h1>🚗 New Customer Entry</h1>
          <p>Fill in the details for the new ride entry</p>
          {location.state && location.state.isQuickRide && (
            <div className="quick-ride-notice">
              <span>⚡ Quick Ride - Pre-filled from customer data</span>
            </div>
          )}
        </div>

        {apiError && <div className="error-message">⚠️ {apiError}</div>}

        <form onSubmit={handleSubmit} className="new-ride-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="customerName">Customer Name *</label>
              <input
                id="customerName"
                name="customerName"
                type="text"
                value={formData.customerName}
                onChange={handleChange}
                placeholder="Enter customer's full name"
                className={errors.customerName ? "error" : ""}
                required
              />
              {errors.customerName && <span className="field-error">{errors.customerName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="contactNumber">Contact Number</label>
              <input
                id="contactNumber"
                name="contactNumber"
                type="tel"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="Enter contact number"
                className={errors.contactNumber ? "error" : ""}
              />
              {errors.contactNumber && <span className="field-error">{errors.contactNumber}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="fromLocation">From Location *</label>
              <input
                id="fromLocation"
                name="fromLocation"
                type="text"
                value={formData.fromLocation}
                onChange={handleChange}
                placeholder="Enter pickup location"
                className={errors.fromLocation ? "error" : ""}
                required
              />
              {errors.fromLocation && <span className="field-error">{errors.fromLocation}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="toLocation">To Location *</label>
              <input
                id="toLocation"
                name="toLocation"
                type="text"
                value={formData.toLocation}
                onChange={handleChange}
                placeholder="Enter destination location"
                className={errors.toLocation ? "error" : ""}
                required
              />
              {errors.toLocation && <span className="field-error">{errors.toLocation}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="amount">Amount *</label>
              <div className="input-with-currency">
                <span className="currency">৳</span>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className={errors.amount ? "error" : ""}
                  required
                />
              </div>
              {errors.amount && <span className="field-error">{errors.amount}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="date">Date *</label>
              <input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                max={new Date().toISOString().split("T")[0]}
                className={errors.date ? "error" : ""}
                required
              />
              {errors.date && <span className="field-error">{errors.date}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="cost">Cost</label>
              <div className="input-with-currency">
                <span className="currency">৳</span>
                <input
                  id="cost"
                  name="cost"
                  type="number"
                  value={formData.cost}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className={errors.cost ? "error" : ""}
                />
              </div>
              {errors.cost && <span className="field-error">{errors.cost}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="save">Save</label>
              <div className="input-with-currency">
                <span className="currency">৳</span>
                <input
                  id="save"
                  name="save"
                  type="number"
                  value={formData.save}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className={errors.save ? "error" : ""}
                />
              </div>
              {errors.save && <span className="field-error">{errors.save}</span>}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate(-1)} className="cancel-button">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting || Object.keys(errors).length > 0} className="submit-button">
              {isSubmitting ? "Submitting..." : "Submit Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NewRide
