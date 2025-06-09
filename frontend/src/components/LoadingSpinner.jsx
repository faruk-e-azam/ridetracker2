const LoadingSpinner = ({ message = "Loading..." }) => {
    return (
      <div className="dashboard-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>{message}</p>
        </div>
      </div>
    )
  }
  
  export default LoadingSpinner
  