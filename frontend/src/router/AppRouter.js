

import { Navigate, Route, Routes } from "react-router-dom"
import Navigation from "../components/Navigation"
import PrivateRoute from "../components/PrivateRoute"
import { AuthProvider, useAuth } from "../context/AuthContext"
import CustomerDetails from "../pages/CustomerDetails"
import Dashboard from "../pages/Dashboard"
import Login from "../pages/Login"
import MonthlyEarnings from "../pages/MonthlyEarnings"
import NewRide from "../pages/NewRide"
import Signup from "../pages/SignUp"

const AppContent = () => {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  // Determine default route based on user role
  const getDefaultRoute = () => {
    if (user?.role === "admin") {
      return "/dashboard"
    }
    return "/new-ride"
  }

  return (
    <div className="app-container">
      <Navigation />
      <main className="main-content">
        <Routes>
          {isAuthenticated ? (
            // Authenticated user routes
            <>
              <Route path="/new-ride" element={<NewRide />} />
              <Route path="/customer-details" element={<CustomerDetails />} />

              {/* Private Routes for admin */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/monthly-earnings"
                element={
                  <PrivateRoute>
                    <MonthlyEarnings />
                  </PrivateRoute>
                }
              />

              {/* Redirect authenticated users away from auth pages */}
              <Route path="/login" element={<Navigate to={getDefaultRoute()} replace />} />
              <Route path="/signup" element={<Navigate to={getDefaultRoute()} replace />} />

              {/* Default redirect for authenticated users based on role */}
              <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />

              {/* Catch all other routes */}
              <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
            </>
          ) : (
            // Non-authenticated user routes
            <>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Redirect non-authenticated users to login */}
              <Route path="/new-ride" element={<Navigate to="/login" replace />} />
              <Route path="/customer-details" element={<Navigate to="/login" replace />} />
              <Route path="/dashboard" element={<Navigate to="/login" replace />} />
              <Route path="/monthly-earnings" element={<Navigate to="/login" replace />} />

              {/* Default redirect for non-authenticated users */}
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* Catch all other routes */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          )}
        </Routes>
      </main>
    </div>
  )
}

const AppRouter = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default AppRouter