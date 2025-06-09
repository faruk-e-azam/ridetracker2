
import { formatDate } from "../utils/dateUtils"

const CustomerCard = ({ customer, onViewDetails, onQuickRide }) => {
  return (
    <div className="customer-card">
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
        <button className="view-details-btn" onClick={() => onViewDetails(customer)}>
          👁️ View Details
        </button>
        <button className="quick-ride-btn" onClick={() => onQuickRide(customer)}>
          🚗 Quick Ride
        </button>
      </div>
    </div>
  )
}

export default CustomerCard
