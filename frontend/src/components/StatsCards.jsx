const StatsCards = ({ totals }) => {
    const statsData = [
      {
        title: "Total Customers",
        value: totals.totalCustomers,
        icon: "👥",
        className: "customer-count",
      },
      {
        title: "Total Income",
        value: `৳${totals.totalIncome.toFixed(2)}`,
        icon: "💰",
        className: "income-count",
      },
      {
        title: "Total Cost",
        value: `৳${totals.totalCost.toFixed(2)}`,
        icon: "📊",
        className: "cost-count",
      },
      {
        title: "Total Save",
        value: `৳${totals.totalSave.toFixed(2)}`,
        icon: "🏦",
        className: "save-count",
      },
    ]
  
    return (
      <div className="total-count">
        <div className="count-page-width">
          {statsData.map((stat, index) => (
            <div key={index} className="single-count">
              <div className={stat.className}>
                <div className="count-icon">{stat.icon}</div>
                <div className="count-info">
                  <h3>{stat.title}</h3>
                  <span className="count-number">{stat.value}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  export default StatsCards
  