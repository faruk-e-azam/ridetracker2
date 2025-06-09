

import { useMemo, useState } from "react"

export const useCustomerFilters = (customers) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")

  const filteredCustomers = useMemo(() => {
    const filtered = customers.filter((customer) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        customer.customerName.toLowerCase().includes(searchLower) ||
        (customer.contactNumber && customer.contactNumber.toLowerCase().includes(searchLower)) ||
        customer.location.toLowerCase().includes(searchLower)
      )
    })

    // Sort functionality
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        break
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        break
      case "name":
        filtered.sort((a, b) => a.customerName.localeCompare(b.customerName))
        break
      case "amount":
        filtered.sort((a, b) => b.amount - a.amount)
        break
      default:
        break
    }

    return filtered
  }, [customers, searchTerm, sortBy])

  return {
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    filteredCustomers,
  }
}
