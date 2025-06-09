"use client"

const PageHeader = ({ onAddCustomer }) => {
  return (
    <div className="page-header">
      <div className="header-content">
        <h1 className="page-title">👥 Customer Details</h1>
        <p className="page-subtitle">View and manage all customer information</p>
      </div>
      <div className="header-actions">
        <button className="add-customer-btn" onClick={onAddCustomer}>
          ➕ Add New Customer
        </button>
      </div>
    </div>
  )
}

export default PageHeader
