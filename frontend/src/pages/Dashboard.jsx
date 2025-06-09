

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import CustomerTable from "../components/CustomerTable"
import DashboardFooter from "../components/DashboardFooter"
import DeleteModal from "../components/DeleteModal"
import EditModal from "../components/EditModal"
import ErrorBanner from "../components/ErrorBanner"
import LoadingSpinner from "../components/LoadingSpinner"
import StatsCards from "../components/StatsCards"
import { useCustomers } from "../hooks/useCustomers"
import "../styles/dashboard.css"
import { validateCustomerForm } from "../utils/validation"

const Dashboard = () => {
  const navigate = useNavigate()
  const { customers, totals, loading, error, lastUpdated, fetchCustomers, deleteCustomer, updateCustomer, setError } =
    useCustomers()

  // Edit Modal State
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Event Handlers
  const handleAddCustomer = () => {
    navigate("/new-ride")
  }

  const handleRefresh = () => {
    fetchCustomers()
  }

  const handleEdit = (customer) => {
    setEditingCustomer(customer)
    setIsEditModalOpen(true)
    setError("")
  }

  const handleSaveEdit = async (updateData) => {
    setError("")

    const validation = validateCustomerForm(updateData)
    if (!validation.isValid) {
      setError(validation.errors[0])
      return
    }

    setIsSaving(true)
    const result = await updateCustomer(editingCustomer._id, updateData)

    if (result.success) {
      setIsEditModalOpen(false)
      setEditingCustomer(null)
      setError("")
    } else {
      setError(result.error)
    }

    setIsSaving(false)
  }

  const handleCancelEdit = () => {
    setIsEditModalOpen(false)
    setEditingCustomer(null)
    setError("")
  }

  const handleDeleteClick = (customer) => {
    setCustomerToDelete(customer)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return

    setIsDeleting(true)
    const result = await deleteCustomer(customerToDelete._id)

    if (result.success) {
      setIsDeleteModalOpen(false)
      setCustomerToDelete(null)
      setError("")
    } else {
      setError(result.error)
    }

    setIsDeleting(false)
  }

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false)
    setCustomerToDelete(null)
  }

  const handleCloseError = () => {
    setError("")
  }

  if (loading) {
    return <LoadingSpinner message="Loading customer data..." />
  }

  return (
    <>
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h2>🏠 Customer Dashboard</h2>
            <p>Overview of your ride tracking business</p>
          </div>
          <div className="dashboard-actions">
            <button className="refresh-btn" onClick={handleRefresh}>
              🔄 Refresh
            </button>
            <button className="add-btn" onClick={handleAddCustomer}>
              ➕ Add Customer
            </button>
          </div>
        </div>

        <ErrorBanner error={error} onClose={handleCloseError} />

        <StatsCards totals={totals} />

        <div className="customer-table">
          <div className="customer-details">
            <div className="table-header">
              <h3 className="customer-recent">Recent Customers</h3>
              <span className="customer-count-badge">{customers.length} customers</span>
            </div>

            <CustomerTable customers={customers} onEdit={handleEdit} onDelete={handleDeleteClick} />
          </div>
        </div>

        <DashboardFooter lastUpdated={lastUpdated} />
      </div>

      <EditModal
        isOpen={isEditModalOpen}
        customer={editingCustomer}
        onSave={handleSaveEdit}
        onCancel={handleCancelEdit}
        error={error}
        isSaving={isSaving}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        customer={customerToDelete}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={isDeleting}
      />
    </>
  )
}

export default Dashboard
