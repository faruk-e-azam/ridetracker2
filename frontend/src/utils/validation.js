export const validateCustomerForm = (formData) => {
    const errors = []
  
    if (!formData.customerName?.trim()) {
      errors.push("Customer name is required")
    }
  
    if (!formData.location?.trim()) {
      errors.push("Location is required")
    }
  
    if (!formData.amount || Number.parseFloat(formData.amount) <= 0) {
      errors.push("Amount must be a positive number")
    }
  
    if (!formData.date) {
      errors.push("Date is required")
    }
  
    return {
      isValid: errors.length === 0,
      errors,
    }
  }
  
  export const formatCurrency = (amount) => {
    return `৳${Number.parseFloat(amount || 0).toFixed(2)}`
  }
  
  export const formatDate = (date) => {
    return new Date(date).toLocaleDateString()
  }
  
  export const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }
  