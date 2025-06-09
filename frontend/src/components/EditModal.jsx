

import { useEffect, useState } from "react"

const EditModal = ({ isOpen, customer, onSave, onCancel, error, isSaving }) => {
  const [formData, setFormData] = useState({
    customerName: "",
    location: "",
    amount: "",
    cost: "",
    save: "",
    date: "",
  })

  useEffect(() => {
    if (customer) {
      setFormData({
        customerName: customer.customerName,
        location: customer.location,
        amount: customer.amount.toString(),
        cost: customer.cost?.toString() || "",
        save: customer.save?.toString() || "",
        date: new Date(customer.date).toISOString().split("T")[0],
      })
    }
  }, [customer])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const updateData = {
      customerName: formData.customerName.trim(),
      location: formData.location.trim(),
      amount: Number.parseFloat(formData.amount),
      cost: Number.parseFloat(formData.cost) || 0,
      save: Number.parseFloat(formData.save) || 0,
      date: formData.date,
    }

    onSave(updateData)
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>✏️ Edit Customer</h3>
          <button className="close-btn" onClick={onCancel}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="form-error">⚠️ {error}</div>}

            <div className="form-group">
              <label htmlFor="customerName">Customer Name *</label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                placeholder="Enter customer name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">Location *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter location"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="amount">Amount *</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Enter amount"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="cost">Cost</label>
              <input
                type="number"
                id="cost"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                placeholder="Enter cost"
                step="0.01"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="save">Save</label>
              <input
                type="number"
                id="save"
                name="save"
                value={formData.save}
                onChange={handleChange}
                placeholder="Enter save amount"
                step="0.01"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="date">Date *</label>
              <input type="date" id="date" name="date" value={formData.date} onChange={handleChange} required />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onCancel} disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={isSaving}>
              {isSaving ? "💾 Saving..." : "💾 Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditModal
