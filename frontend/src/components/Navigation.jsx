

import { useEffect, useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "../styles/navigation.css"

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const { isAuthenticated, user, logout } = useAuth()

  useEffect(() => {
    setIsMenuOpen(false)
  }, [location])

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
  }

  // Don't show navigation on login or signup pages for non-authenticated users
  if (!isAuthenticated && (location.pathname === "/login" || location.pathname === "/signup")) {
    return null
  }

  // Define navigation items based on authentication status and user role
  const getNavItems = () => {
    if (!isAuthenticated) {
      return []
    }

    if (user?.role === "admin") {
      // Admin user - show all pages including admin-specific ones
      return [
        { href: "/dashboard", label: "Dashboard", icon: "🏠", protected: true },
        { href: "/monthly-earnings", label: "Monthly Earnings", icon: "📊", protected: true },
      ]
    }

    // Regular authenticated user - show basic pages
    return [
      { href: "/new-ride", label: "New Ride", icon: "🚗", protected: false },
      { href: "/customer-details", label: "Customer Details", icon: "👥", protected: false },
    ]
  }

  const navItems = getNavItems()

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <div className="brand-icon">🚗</div>
          <span className="brand-text">RideTracker</span>
        </div>

        <ul className="nav-links desktop-nav">
          {navItems.map((item) => (
            <li key={item.href} className="nav-item">
              <NavLink to={item.href} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                <div className="link-content">
                  <div className="link-icon">{item.icon}</div>
                  <span className="link-text">{item.label}</span>
                </div>
              </NavLink>
            </li>
          ))}

          {isAuthenticated ? (
            <li className="nav-item">
              <button onClick={handleLogout} className="nav-link logout-btn">
                <div className="link-content">
                  <div className="link-icon">🚪</div>
                  <span className="link-text">Logout</span>
                </div>
              </button>
            </li>
          ) : (
            <>
              <li className="nav-item">
                <NavLink to="/login" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                  <div className="link-content">
                    <div className="link-icon">🔐</div>
                    <span className="link-text">Login</span>
                  </div>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/signup" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                  <div className="link-content">
                    <div className="link-icon">📝</div>
                    <span className="link-text">Sign Up</span>
                  </div>
                </NavLink>
              </li>
            </>
          )}
        </ul>

        {/* Mobile Menu Button */}
        <button className={`mobile-menu-btn ${isMenuOpen ? "open" : ""}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="mobile-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) => `mobile-nav-link ${isActive ? "active" : ""}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="mobile-link-icon">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}

            {isAuthenticated ? (
              <button onClick={handleLogout} className="mobile-nav-link logout-btn">
                <span className="mobile-link-icon">🚪</span>
                <span>Logout</span>
              </button>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) => `mobile-nav-link ${isActive ? "active" : ""}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="mobile-link-icon">🔐</span>
                  <span>Login</span>
                </NavLink>
                <NavLink
                  to="/signup"
                  className={({ isActive }) => `mobile-nav-link ${isActive ? "active" : ""}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="mobile-link-icon">📝</span>
                  <span>Sign Up</span>
                </NavLink>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navigation
