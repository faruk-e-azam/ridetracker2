

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "../styles/signup.css"

const Signup = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",  
    email: "",
    fullName: "",
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)

  const validateField = (name, value) => {
    const newErrors = { ...errors }

    // eslint-disable-next-line default-case
    switch (name) {
      case "username":
        if (value.length < 3) {
          newErrors.username = "Username must be at least 3 characters"
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          newErrors.username = "Username can only contain letters, numbers and underscore"
        } else {
          delete newErrors.username
        }
        break
      case "password":
        if (value.length < 6) {
          newErrors.password = "Password must be at least 6 characters"
        } else {
          delete newErrors.password
        }
        break
      case "confirmPassword":
        if (value !== formData.password) {
          newErrors.confirmPassword = "Passwords do not match"
        } else {
          delete newErrors.confirmPassword
        }
        break
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (value && !emailRegex.test(value)) {
          newErrors.email = "Please enter a valid email address"
        } else {
          delete newErrors.email
        }
        break
      case "fullName":
        if (value && value.length < 2) {
          newErrors.fullName = "Full name must be at least 2 characters"
        } else {
          delete newErrors.fullName
        }
        break
    }

    setErrors(newErrors)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    validateField(name, value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setApiError("")

    // Validate all fields before submission
    Object.keys(formData).forEach((key) => {
      validateField(key, formData[key])
    })

    // Check if there are any errors
    if (Object.keys(errors).length > 0) {
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch(`${process.env.BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          email: formData.email,
          fullName: formData.fullName,
          role: "customer", // Default role for signup
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to create account")
      }

      setShowSuccess(true)
      setTimeout(() => {
        navigate("/login")
      }, 2000)
    } catch (error) {
      console.error("Registration error:", error)
      setApiError(error.message || "Failed to create account. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (showSuccess) {
    return (
      <div className="success-container">
        <div className="success-card">
          <div className="success-icon">✅</div>
          <h2>Account Created!</h2>
          <p>Your account has been created successfully. Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <h1>Create an Account</h1>
          <p>Join RideTracker to start tracking your rides</p>
        </div>

        {apiError && <div className="error-message">⚠️ {apiError}</div>}

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <label htmlFor="username">Username *</label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              className={errors.username ? "error" : ""}
              required
            />
            {errors.username && <span className="field-error">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              className={errors.password ? "error" : ""}
              required
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className={errors.confirmPassword ? "error" : ""}
              required
            />
            {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email (optional)"
              className={errors.email ? "error" : ""}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name (optional)"
              className={errors.fullName ? "error" : ""}
            />
            {errors.fullName && <span className="field-error">{errors.fullName}</span>}
          </div>

          <div className="form-actions">
            <button type="submit" disabled={isSubmitting || Object.keys(errors).length > 0} className="signup-button">
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </button>
          </div>
        </form>

        <div className="login-link">
          Already have an account?{" "}
          <a
            href="/login"
            onClick={(e) => {
              e.preventDefault()
              navigate("/login")
            }}
          >
            Log in
          </a>
        </div>
      </div>
    </div>
  )
}

export default Signup
