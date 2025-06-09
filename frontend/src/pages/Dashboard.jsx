

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import "../styles/dashboard.css"

const Dashboard = () => {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [totals, setTotals] = useState({
    totalCustomers: 0,
    totalIncome: 0,
    totalCost: 0,
    totalSave: 0,
  })
  const [loading, setLoading] = useState(true)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [editFormData, setEditFormData] = useState({
    customerName: "",
    location: "",
    amount: "",
    cost: "",
    save: "",
    date: "",
  })
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Delete confirmation popup state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      setError("")

      // Fetch customers sorted by most recent first
      const response = await fetch(`http://localhost:5000/api/customer?sort=-createdAt`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setCustomers(data)

      // Calculate totals from the fetched data
      const totalCustomers = data.length
      const totalIncome = data.reduce((sum, customer) => {
        return sum + (Number.parseFloat(customer.amount) || 0)
      }, 0)
      const totalCost = data.reduce((sum, customer) => {
        return sum + (Number.parseFloat(customer.cost) || 0)
      }, 0)
      const totalSave = data.reduce((sum, customer) => {
        return sum + (Number.parseFloat(customer.save) || 0)
      }, 0)

      setTotals({
        totalCustomers,
        totalIncome,
        totalCost,
        totalSave,
      })
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Failed to load customer data. Please check if the server is running.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  // Show delete confirmation popup
  const handleDeleteClick = (customer) => {
    setCustomerToDelete(customer)
    setIsDeleteModalOpen(true)
  }

  // Cancel delete
  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false)
    setCustomerToDelete(null)
  }

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!customerToDelete) return

    try {
      setIsDeleting(true)
      const response = await fetch(`http://localhost:5000/api/customers/${customerToDelete._id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete customer")
      }

      // Show success message
      setError("")

      // Close modal and refresh data
      setIsDeleteModalOpen(false)
      setCustomerToDelete(null)
      await fetchCustomers()
    } catch (error) {
      console.error("Error deleting customer:", error)
      setError("Error deleting customer. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = (customer) => {
    setEditingCustomer(customer)
    setEditFormData({
      customerName: customer.customerName,
      location: customer.location,
      amount: customer.amount.toString(),
      cost: customer.cost?.toString() || "",
      save: customer.save?.toString() || "",
      date: new Date(customer.date).toISOString().split("T")[0],
    })
    setIsEditModalOpen(true)
    setError("")
  }

  const handleEditFormChange = (e) => {
    const { name, value } = e.target
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateForm = () => {
    if (!editFormData.customerName.trim()) {
      setError("Customer name is required")
      return false
    }
    if (!editFormData.location.trim()) {
      setError("Location is required")
      return false
    }
    if (!editFormData.amount || Number.parseFloat(editFormData.amount) <= 0) {
      setError("Amount must be a positive number")
      return false
    }
    if (!editFormData.date) {
      setError("Date is required")
      return false
    }
    return true
  }

  const handleSaveEdit = async () => {
    setError("")

    if (!validateForm()) {
      return
    }

    try {
      setIsSaving(true)

      const updateData = {
        customerName: editFormData.customerName.trim(),
        location: editFormData.location.trim(),
        amount: Number.parseFloat(editFormData.amount),
        cost: Number.parseFloat(editFormData.cost) || 0,
        save: Number.parseFloat(editFormData.save) || 0,
        date: editFormData.date,
      }

      const response = await fetch(`http://localhost:5000/api/customer/${editingCustomer._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update customer")
      }

      // Refresh data after successful update
      await fetchCustomers()

      // Close modal
      setIsEditModalOpen(false)
      setEditingCustomer(null)
      setError("")
    } catch (error) {
      console.error("Error updating customer:", error)
      setError("Error updating customer. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditModalOpen(false)
    setEditingCustomer(null)
    setEditFormData({
      customerName: "",
      location: "",
      amount: "",
      cost: "",
      save: "",
      date: "",
    })
    setError("")
  }

  const handleAddCustomer = () => {
    navigate("/new-ride")
  }

  const refreshData = () => {
    fetchCustomers()
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading customer data...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h2>🏠 Customer Dashboard</h2>
            <p>Overview of your ride tracking business</p>
          </div>
          <div className="dashboard-actions">
            <button className="refresh-btn" onClick={refreshData}>
              🔄 Refresh
            </button>
            <button className="add-btn" onClick={handleAddCustomer}>
              ➕ Add Customer
            </button>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <span>⚠️ {error}</span>
            <button onClick={() => setError("")}>✕</button>
          </div>
        )}

        <div className="total-count">
          <div className="count-page-width">
            <div className="single-count">
              <div className="customer-count">
                <div className="count-icon">👥</div>
                <div className="count-info">
                  <h3>Total Customers</h3>
                  <span className="count-number">{totals.totalCustomers}</span>
                </div>
              </div>
            </div>
            <div className="single-count">
              <div className="income-count">
                <div className="count-icon">💰</div>
                <div className="count-info">
                  <h3>Total Income</h3>
                  <span className="count-number">৳{totals.totalIncome.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className="single-count">
              <div className="cost-count">
                <div className="count-icon">📊</div>
                <div className="count-info">
                  <h3>Total Cost</h3>
                  <span className="count-number">৳{totals.totalCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className="single-count">
              <div className="save-count">
                <div className="count-icon">🏦</div>
                <div className="count-info">
                  <h3>Total Save</h3>
                  <span className="count-number">৳{totals.totalSave.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="customer-table">
          <div className="customer-details">
            <div className="table-header">
              <h3 className="customer-recent">Recent Customers</h3>
              <span className="customer-count-badge">{customers.length} customers</span>
            </div>

            {customers.length === 0 ? (
              <div className="no-data">
                <p>📋 No customer data available.</p>
                <button className="add-btn" onClick={handleAddCustomer}>
                  Add Your First Customer
                </button>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead className="customer_header">
                    <tr>
                      <th>Name</th>
                      <th>Location</th>
                      <th>Amount</th>
                      <th>Cost</th>
                      <th>Save</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="customer_body">
                    {customers.map((customer, index) => {
                      const isNew = index < 3 // Highlight first 3 entries as "new"
                      const isVeryRecent = new Date() - new Date(customer.createdAt) < 300000 // 5 minutes

                      return (
                        <tr key={customer._id} className={isVeryRecent ? "recent-entry" : ""}>
                          <td>
                            <div className="customer-name">
                              <span className="name-initial">{customer.customerName.charAt(0).toUpperCase()}</span>
                              {customer.customerName}
                              {isNew && <span className="new-badge">NEW</span>}
                            </div>
                          </td>
                          <td>
                            <span className="location">📍 {customer.location}</span>
                          </td>
                          <td>
                            <span className="amount">৳{Number.parseFloat(customer.amount).toFixed(2)}</span>
                          </td>
                          <td>
                            <span className="cost">৳{Number.parseFloat(customer.cost || 0).toFixed(2)}</span>
                          </td>
                          <td>
                            <span className="save">৳{Number.parseFloat(customer.save || 0).toFixed(2)}</span>
                          </td>
                          <td>
                            <span className="date">
                              {new Date(customer.createdAt || customer.date).toLocaleDateString()}
                              <br />
                              <small className="time">
                                {new Date(customer.createdAt || customer.date).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </small>
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button className="edit-btn" onClick={() => handleEdit(customer)} title="Edit customer">
                                ✏️ Edit
                              </button>
                              <button
                                className="delete-btn"
                                onClick={() => handleDeleteClick(customer)}
                                title="Delete customer"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-footer">
          <p>Last updated: {lastUpdated.toLocaleString()}</p>
          <p>This is a protected admin page. Only administrators can view and edit customer data.</p>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleCancelEdit()}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>✏️ Edit Customer</h3>
              <button className="close-btn" onClick={handleCancelEdit}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              {error && <div className="form-error">⚠️ {error}</div>}

              <div className="form-group">
                <label htmlFor="customerName">Customer Name *</label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  value={editFormData.customerName}
                  onChange={handleEditFormChange}
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
                  value={editFormData.location}
                  onChange={handleEditFormChange}
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
                  value={editFormData.amount}
                  onChange={handleEditFormChange}
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
                  value={editFormData.cost}
                  onChange={handleEditFormChange}
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
                  value={editFormData.save}
                  onChange={handleEditFormChange}
                  placeholder="Enter save amount"
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="date">Date *</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={editFormData.date}
                  onChange={handleEditFormChange}
                  required
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={handleCancelEdit} disabled={isSaving}>
                Cancel
              </button>
              <button className="save-btn" onClick={handleSaveEdit} disabled={isSaving}>
                {isSaving ? "💾 Saving..." : "💾 Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && customerToDelete && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleCancelDelete()}>
          <div className="modal-content delete-modal">
            <div className="modal-header delete-header">
              <h3>🗑️ Delete Customer</h3>
              <button className="close-btn" onClick={handleCancelDelete}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="delete-warning">
                <div className="warning-icon">⚠️</div>
                <p>Are you sure you want to delete this customer?</p>
              </div>

              <div className="customer-summary">
                <div className="summary-row">
                  <span className="summary-label">Customer:</span>
                  <span className="summary-value">{customerToDelete.customerName}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Location:</span>
                  <span className="summary-value">{customerToDelete.location}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Amount:</span>
                  <span className="summary-value">৳{Number.parseFloat(customerToDelete.amount).toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Date:</span>
                  <span className="summary-value">
                    {new Date(customerToDelete.createdAt || customerToDelete.date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="delete-notice">
                <p>This action cannot be undone.</p>
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={handleCancelDelete} disabled={isDeleting}>
                Cancel
              </button>
              <button className="delete-confirm-btn" onClick={handleConfirmDelete} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete Customer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Dashboard
