

const ErrorBanner = ({ error, onClose }) => {
  if (!error) return null

  return (
    <div className="error-banner">
      <span>⚠️ {error}</span>
      <button onClick={onClose}>✕</button>
    </div>
  )
}

export default ErrorBanner
