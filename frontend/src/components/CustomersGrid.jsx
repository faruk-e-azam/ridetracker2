import CustomerCard from "./CustomerCard"

const CustomersGrid = ({ customers, onViewDetails, onQuickRide, searchTerm }) => {
  if (customers.length === 0) {
    return (
      <div className="no-customers">
        <div className="no-customers-icon">📋</div>
        <h3>No customers found</h3>
        <p>{searchTerm ? "Try adjusting your search terms" : "Start by adding your first customer"}</p>
      </div>
    )
  }

  return (
    <div className="customers-grid">
      {customers.map((customer) => (
        <CustomerCard key={customer._id} customer={customer} onViewDetails={onViewDetails} onQuickRide={onQuickRide} />
      ))}
    </div>
  )
}

export default CustomersGrid
