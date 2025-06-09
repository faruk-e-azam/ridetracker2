const DashboardFooter = ({ lastUpdated }) => {
    return (
      <div className="dashboard-footer">
        <p>Last updated: {lastUpdated ? lastUpdated.toLocaleString() : "Never"}</p>
        <p>This is a protected admin page. Only administrators can view and edit customer data.</p>
      </div>
    )
  }
  
  export default DashboardFooter
  