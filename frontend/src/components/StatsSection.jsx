const StatsSection = ({ customers }) => {
    const totalRevenue = customers.reduce((sum, customer) => sum + customer.amount, 0)
    const averagePerCustomer = customers.length > 0 ? totalRevenue / customers.length : 0
  
    return (
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <span className="stat-number">{customers.length}</span>
            <span className="stat-label">Total Customers</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <span className="stat-number">৳{totalRevenue.toFixed(2)}</span>
            <span className="stat-label">Total Revenue</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <span className="stat-number">৳{averagePerCustomer.toFixed(2)}</span>
            <span className="stat-label">Avg per Customer</span>
          </div>
        </div>
      </div>
    )
  }
  
  export default StatsSection
  