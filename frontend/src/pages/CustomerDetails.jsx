

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import CustomerModal from "../components/CustomerModal"
import CustomersGrid from "../components/CustomersGrid"
import ErrorBanner from "../components/ErrorBanner"
import LoadingState from "../components/LoadingSpinner"
import PageHeader from "../components/PageHeader"
import SearchAndFilters from "../components/SearchAndFilters"
import StatsSection from "../components/StatsSection"
import { useCustomerFilters } from "../hooks/useCustomerFilters"
import { useCustomers } from "../hooks/useCustomers"
import "../styles/customerDetails.css"
import { createQuickRideData } from "../utils/navigationUtils"

const CustomerDetails = () => {
  const navigate = useNavigate()
  const { customers, loading, error, setError } = useCustomers()
  const { searchTerm, setSearchTerm, sortBy, setSortBy, filteredCustomers } = useCustomerFilters(customers)

  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleAddCustomer = () => {
    navigate("/new-ride")
  }

  const handleViewDetails = (customer) => {
    setSelectedCustomer(customer)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedCustomer(null)
  }

  const handleQuickRide = (customer) => {
    const quickRideData = createQuickRideData(customer)
    navigate("/new-ride", { state: quickRideData })
  }

  const handleCloseError = () => {
    setError("")
  }

  if (loading) {
    return <LoadingState />
  }

  return (
    <div className="customer-details-container">
      <PageHeader onAddCustomer={handleAddCustomer} />

      <ErrorBanner error={error} onClose={handleCloseError} />

      <SearchAndFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm} sortBy={sortBy} setSortBy={setSortBy} />

      <StatsSection customers={filteredCustomers} />

      <div className="customers-section">
        <CustomersGrid
          customers={filteredCustomers}
          onViewDetails={handleViewDetails}
          onQuickRide={handleQuickRide}
          searchTerm={searchTerm}
        />
      </div>

      <CustomerModal isOpen={isModalOpen} customer={selectedCustomer} onClose={handleCloseModal} />
    </div>
  )
}

export default CustomerDetails
