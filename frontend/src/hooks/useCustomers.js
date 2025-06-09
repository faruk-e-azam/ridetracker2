

import { useCallback, useEffect, useState } from "react"

const API_BASE_URL = "http://localhost:5000/api"

export const useCustomers = () => {
  const [customers, setCustomers] = useState([])
  const [totals, setTotals] = useState({
    totalCustomers: 0,
    totalIncome: 0,
    totalCost: 0,
    totalSave: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [lastUpdated, setLastUpdated] = useState(null) // Initialize as null

  const calculateTotals = useCallback((customerData) => {
    const totalCustomers = customerData.length
    const totalIncome = customerData.reduce((sum, customer) => {
      return sum + (Number.parseFloat(customer.amount) || 0)
    }, 0)
    const totalCost = customerData.reduce((sum, customer) => {
      return sum + (Number.parseFloat(customer.cost) || 0)
    }, 0)
    const totalSave = customerData.reduce((sum, customer) => {
      return sum + (Number.parseFloat(customer.save) || 0)
    }, 0)

    return {
      totalCustomers,
      totalIncome,
      totalCost,
      totalSave,
    }
  }, [])

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch(`${API_BASE_URL}/customer?sort=-createdAt`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setCustomers(data)
      setTotals(calculateTotals(data))
      setLastUpdated(new Date()) // Set the date after successful fetch
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Failed to load customer data. Please check if the server is running.")
    } finally {
      setLoading(false)
    }
  }, [calculateTotals])

  const updateCustomer = useCallback(
    async (id, updateData) => {
      try {
        const response = await fetch(`${API_BASE_URL}/customer/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Failed to update customer")
        }

        await fetchCustomers()
        return { success: true }
      } catch (error) {
        console.error("Error updating customer:", error)
        return { success: false, error: error.message }
      }
    },
    [fetchCustomers],
  )

  const deleteCustomer = useCallback(
    async (id) => {
      try {
        const response = await fetch(`${API_BASE_URL}/customer/${id}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Failed to delete customer")
        }

        await fetchCustomers()
        return { success: true }
      } catch (error) {
        console.error("Error deleting customer:", error)
        return { success: false, error: error.message }
      }
    },
    [fetchCustomers],
  )

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  return {
    customers,
    totals,
    loading,
    error,
    lastUpdated,
    fetchCustomers,
    updateCustomer,
    deleteCustomer,
    setError,
  }
}
