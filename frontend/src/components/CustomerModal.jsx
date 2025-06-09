

import { formatDate, formatTime } from "../utils/dateUtils"

const CustomerModal = ({ isOpen, customer, onClose }) => {
  if (!isOpen || !customer) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Customer Details</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="customer-profile">
            <div className="profile-avatar">{customer.customerName.charAt(0).toUpperCase()}</div>
            <div className="profile-info">
              <h3>{customer.customerName}</h3>
              <p>{customer.contactNumber || "No contact number"}</p>
            </div>
          </div>

          <div className="details-grid">
            <div className="detail-section">
              <h4>📍 Trip Information</h4>
              <div className="detail-row">
                <span className="label">Route:</span>
                <span className="value">{customer.location}</span>
              </div>
              <div className="detail-row">
                <span className="label">Date:</span>
                <span className="value">{formatDate(customer.createdAt || customer.date)}</span>
              </div>
              <div className="detail-row">
                <span className="label">Time:</span>
                <span className="value">{formatTime(customer.createdAt || customer.date)}</span>
              </div>
            </div>

            <div className="detail-section">
              <h4>💰 Financial Information</h4>
              <div className="detail-row">
                <span className="label">Amount:</span>
                <span className="value amount">৳{customer.amount.toFixed(2)}</span>
              </div>
              <div className="detail-row">
                <span className="label">Cost:</span>
                <span className="value cost">৳{customer.cost.toFixed(2)}</span>
              </div>
              <div className="detail-row">
                <span className="label">Save:</span>
                <span className="value save">৳{customer.save.toFixed(2)}</span>
              </div>
              <div className="detail-row profit-row">
                <span className="label">Net Profit:</span>
                <span className="value profit">৳{(customer.amount - customer.cost).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="close-modal-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default CustomerModal
