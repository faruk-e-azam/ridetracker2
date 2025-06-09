
const DeleteModal = ({ isOpen, customer, onConfirm, onCancel, isDeleting }) => {
  if (!isOpen || !customer) return null

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal-content delete-modal">
        <div className="modal-header delete-header">
          <h3>🗑️ Delete Customer</h3>
          <button className="close-btn" onClick={onCancel}>
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
              <span className="summary-value">{customer.customerName}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Location:</span>
              <span className="summary-value">{customer.location}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Amount:</span>
              <span className="summary-value">৳{Number.parseFloat(customer.amount).toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Date:</span>
              <span className="summary-value">
                {new Date(customer.createdAt || customer.date).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="delete-notice">
            <p>This action cannot be undone.</p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onCancel} disabled={isDeleting}>
            Cancel
          </button>
          <button className="delete-confirm-btn" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete Customer"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteModal
