

const CustomerTable = ({ customers, onEdit, onDelete }) => {
  if (customers.length === 0) {
    return (
      <div className="no-data">
        <p>📋 No customer data available.</p>
        <button className="add-btn" onClick={() => (window.location.href = "/new-ride")}>
          Add Your First Customer
        </button>
      </div>
    )
  }

  return (
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
            const isNew = index < 3
            const isVeryRecent = new Date() - new Date(customer.createdAt) < 300000 // 5 minutes

            return (
              <CustomerRow
                key={customer._id}
                customer={customer}
                isNew={isNew}
                isVeryRecent={isVeryRecent}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

const CustomerRow = ({ customer, isNew, isVeryRecent, onEdit, onDelete }) => {
  return (
    <tr className={isVeryRecent ? "recent-entry" : ""}>
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
          <button className="edit-btn" onClick={() => onEdit(customer)} title="Edit customer">
            ✏️ Edit
          </button>
          <button className="delete-btn" onClick={() => onDelete(customer)} title="Delete customer">
            🗑️ Delete
          </button>
        </div>
      </td>
    </tr>
  )
}

export default CustomerTable
