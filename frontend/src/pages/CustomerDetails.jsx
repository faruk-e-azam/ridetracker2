"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import "../styles/customerDetails.css"

const CustomerDetails = () => {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [filteredCustomers, setFilteredCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch(`http://localhost:5000/api/customer`)
      if (!response.ok) {
        throw new Error("Failed to fetch customer data")
      }

      const data = await response.json()
      setCustomers(data)
      setFilteredCustomers(data)
    } catch (error) {
      console.error("Error fetching customers:", error)
      setError("Failed to load customer data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  // Search and filter functionality
  useEffect(() => {
    const filtered = customers.filter((customer) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        customer.customerName.toLowerCase().includes(searchLower) ||
        customer.contactNumber.toLowerCase().includes(searchLower) ||
        customer.location.toLowerCase().includes(searchLower)
      )
    })

    // Sort functionality
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        break
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        break
      case "name":
        filtered.sort((a, b) => a.customerName.localeCompare(b.customerName))
        break
      case "amount":
        filtered.sort((a, b) => b.amount - a.amount)
        break
      default:
        break
    }

    setFilteredCustomers(filtered)
  }, [searchTerm, sortBy, customers])

  const handleViewDetails = (customer) => {
    setSelectedCustomer(customer)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedCustomer(null)
  }
  console.log(process.env.LOCAL_BACKEND)
  const handleQuickRide = (customer) => {
    // Parse the location to extract from and to locations
    const locationParts = customer.location.split(" → ")
    const fromLocation = locationParts[0] || customer.location
    const toLocation = locationParts[1] || ""

    // Navigate to new ride page with pre-filled customer data
    navigate("/new-ride", {
      state: {
        prefillData: {
          customerName: customer.customerName,
          contactNumber: customer.contactNumber || "",
          fromLocation: fromLocation,
          toLocation: toLocation,
          amount: customer.amount.toString(),
          cost: customer.cost.toString(),
          save: customer.save.toString(),
          date: new Date().toISOString().split("T")[0], // Today's date
        },
        isQuickRide: true,
      },
    })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="customer-details-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading customer details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="customer-details-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">👥 Customer Details</h1>
          <p className="page-subtitle">View and manage all customer information</p>
        </div>
        <div className="header-actions">
          <button className="add-customer-btn" onClick={() => navigate("/new-ride")}>
            ➕ Add New Customer
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError("")}>✕</button>
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="controls-section">
        <div className="search-container">
          <div className="search-input-wrapper">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="M21 21l-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              placeholder="Search by name, contact, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="filter-container">
          <label htmlFor="sort-select">Sort by:</label>
          <select id="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name (A-Z)</option>
            <option value="amount">Amount (High-Low)</option>
          </select>
        </div>
      </div>

      {/* Customer Stats */}
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <span className="stat-number">{filteredCustomers.length}</span>
            <span className="stat-label">Total Customers</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <span className="stat-number">
              ৳{filteredCustomers.reduce((sum, customer) => sum + customer.amount, 0).toFixed(2)}
            </span>
            <span className="stat-label">Total Revenue</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <span className="stat-number">
              ৳
              {filteredCustomers.length > 0
                ? (
                    filteredCustomers.reduce((sum, customer) => sum + customer.amount, 0) / filteredCustomers.length
                  ).toFixed(2)
                : "0.00"}
            </span>
            <span className="stat-label">Avg per Customer</span>
          </div>
        </div>
      </div>

      {/* Customer List */}
      <div className="customers-section">
        {filteredCustomers.length === 0 ? (
          <div className="no-customers">
            <div className="no-customers-icon">📋</div>
            <h3>No customers found</h3>
            <p>{searchTerm ? "Try adjusting your search terms" : "Start by adding your first customer"}</p>
          </div>
        ) : (
          <div className="customers-grid">
            {filteredCustomers.map((customer) => (
              <div key={customer._id} className="customer-card">
                <div className="customer-header">
                  <div className="customer-avatar">{customer.customerName.charAt(0).toUpperCase()}</div>
                  <div className="customer-basic-info">
                    <h3 className="customer-name">{customer.customerName}</h3>
                    <p className="customer-contact">📞 {customer.contactNumber || "No contact provided"}</p>
                  </div>
                </div>

                <div className="customer-details">
                  <div className="detail-item">
                    <span className="detail-icon">📍</span>
                    <span className="detail-text">{customer.location}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">💰</span>
                    <span className="detail-text">৳{customer.amount.toFixed(2)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">📅</span>
                    <span className="detail-text">{formatDate(customer.createdAt || customer.date)}</span>
                  </div>
                </div>

                <div className="customer-actions">
                  <button className="view-details-btn" onClick={() => handleViewDetails(customer)}>
                    👁️ View Details
                  </button>
                  <button className="quick-ride-btn" onClick={() => handleQuickRide(customer)}>
                    🚗 Quick Ride
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      {isModalOpen && selectedCustomer && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Customer Details</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="customer-profile">
                <div className="profile-avatar">{selectedCustomer.customerName.charAt(0).toUpperCase()}</div>
                <div className="profile-info">
                  <h3>{selectedCustomer.customerName}</h3>
                  <p>{selectedCustomer.contactNumber || "No contact number"}</p>
                </div>
              </div>

              <div className="details-grid">
                <div className="detail-section">
                  <h4>📍 Trip Information</h4>
                  <div className="detail-row">
                    <span className="label">Route:</span>
                    <span className="value">{selectedCustomer.location}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Date:</span>
                    <span className="value">{formatDate(selectedCustomer.createdAt || selectedCustomer.date)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Time:</span>
                    <span className="value">{formatTime(selectedCustomer.createdAt || selectedCustomer.date)}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>💰 Financial Information</h4>
                  <div className="detail-row">
                    <span className="label">Amount:</span>
                    <span className="value amount">৳{selectedCustomer.amount.toFixed(2)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Cost:</span>
                    <span className="value cost">৳{selectedCustomer.cost.toFixed(2)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Save:</span>
                    <span className="value save">৳{selectedCustomer.save.toFixed(2)}</span>
                  </div>
                  <div className="detail-row profit-row">
                    <span className="label">Net Profit:</span>
                    <span className="value profit">
                      ৳{(selectedCustomer.amount - selectedCustomer.cost).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="close-modal-btn" onClick={handleCloseModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerDetails
