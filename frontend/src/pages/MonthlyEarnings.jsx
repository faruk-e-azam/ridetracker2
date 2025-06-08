
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import "../styles/monthlyEarnings.css"

const MonthlyEarnings = () => {
  const [monthlyData, setMonthlyData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [totalYearlyEarnings, setTotalYearlyEarnings] = useState(0)
  const [totalYearlyCost, setTotalYearlyCost] = useState(0)
  const [totalYearlySave, setTotalYearlySave] = useState(0)
  const [availableYears, setAvailableYears] = useState([])

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const navigate = useNavigate()

  const fetchMonthlyEarnings = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch(`${process.env.BACKEND_URL}/api/customer`)
      if (!response.ok) {
        throw new Error("Failed to fetch customer data")
      }

      const customers = await response.json()

      // Process data to group by month and year
      const monthlyEarnings = {}
      const years = new Set()

      customers.forEach((customer) => {
        const date = new Date(customer.createdAt || customer.date)
        const year = date.getFullYear()
        const month = date.getMonth()

        years.add(year)

        const key = `${year}-${month}`
        if (!monthlyEarnings[key]) {
          monthlyEarnings[key] = {
            year,
            month,
            monthName: monthNames[month],
            totalEarnings: 0,
            totalCost: 0,
            totalSave: 0,
            customerCount: 0,
          }
        }

        const amount = Number.parseFloat(customer.amount) || 0
        const cost = Number.parseFloat(customer.cost) || 0
        const save = Number.parseFloat(customer.save) || 0

        monthlyEarnings[key].totalEarnings += amount
        monthlyEarnings[key].totalCost += cost
        monthlyEarnings[key].totalSave += save
        monthlyEarnings[key].customerCount += 1
      })

      // Convert to array and sort by year and month
      const sortedData = Object.values(monthlyEarnings).sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year
        return b.month - a.month
      })

      // Filter by selected year
      const yearData = sortedData.filter((item) => item.year === selectedYear)

      // Calculate yearly totals
      const yearlyEarnings = yearData.reduce((sum, month) => sum + month.totalEarnings, 0)
      const yearlyCost = yearData.reduce((sum, month) => sum + month.totalCost, 0)
      const yearlySave = yearData.reduce((sum, month) => sum + month.totalSave, 0)

      setMonthlyData(yearData)
      setTotalYearlyEarnings(yearlyEarnings)
      setTotalYearlyCost(yearlyCost)
      setTotalYearlySave(yearlySave)
      setAvailableYears(Array.from(years).sort((a, b) => b - a))
    } catch (error) {
      console.error("Error fetching monthly earnings:", error)
      setError("Failed to load earnings data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMonthlyEarnings()
  }, [selectedYear])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading monthly earnings...</p>
      </div>
    )
  }

  return (
    <div className="monthly-earnings-container">
      <div className="earnings-header">
        <div>
          <h1>📊 Monthly Earnings</h1>
          <p>Track your earnings performance month by month</p>
        </div>
        <div className="earnings-controls">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="year-select"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <button onClick={fetchMonthlyEarnings} className="refresh-button">
            🔄 Refresh
          </button>
        </div>
      </div>

      {error && <div className="error-message">⚠️ {error}</div>}

      {/* Yearly Summary Cards */}
      <div className="yearly-stats-grid">
        <div className="yearly-stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Income</h3>
            <p className="stat-number income">৳{totalYearlyEarnings.toFixed(2)}</p>
            <p className="stat-year">{selectedYear}</p>
          </div>
        </div>

        <div className="yearly-stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Total Cost</h3>
            <p className="stat-number cost">৳{totalYearlyCost.toFixed(2)}</p>
            <p className="stat-year">{selectedYear}</p>
          </div>
        </div>

        <div className="yearly-stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <h3>Net Profit</h3>
            <p className="stat-number profit">৳{(totalYearlyEarnings - totalYearlyCost).toFixed(2)}</p>
            <p className="stat-year">{selectedYear}</p>
          </div>
        </div>

        <div className="yearly-stat-card">
          <div className="stat-icon">🏦</div>
          <div className="stat-content">
            <h3>Total Save</h3>
            <p className="stat-number save">৳{totalYearlySave.toFixed(2)}</p>
            <p className="stat-year">{selectedYear}</p>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="monthly-breakdown">
        <div className="breakdown-header">
          <h2>Monthly Breakdown</h2>
        </div>

        {monthlyData.length === 0 ? (
          <div className="no-data">
            <div className="no-data-icon">📈</div>
            <h3>No earnings data for {selectedYear}</h3>
            <p>Start adding customer entries to see your monthly earnings here.</p>
          </div>
        ) : (
          <div className="monthly-grid">
            {monthlyData.map((month) => (
              <div key={`${month.year}-${month.month}`} className="month-card">
                <div className="month-header">
                  <h3>{month.monthName}</h3>
                  <span className="month-year">{month.year}</span>
                </div>

                <div className="month-stats">
                  <div className="month-stat">
                    <span className="stat-label">Earnings:</span>
                    <span className="stat-value income">৳{month.totalEarnings.toFixed(2)}</span>
                  </div>
                  <div className="month-stat">
                    <span className="stat-label">Rides:</span>
                    <span className="stat-value">{month.customerCount}</span>
                  </div>
                  <div className="month-stat">
                    <span className="stat-label">Avg/Ride:</span>
                    <span className="stat-value">
                      ৳{month.customerCount > 0 ? (month.totalEarnings / month.customerCount).toFixed(2) : "0.00"}
                    </span>
                  </div>
                  <div className="month-stat">
                    <span className="stat-label">Costs:</span>
                    <span className="stat-value cost">৳{month.totalCost.toFixed(2)}</span>
                  </div>
                  <div className="month-stat total">
                    <span className="stat-label">Net Profit:</span>
                    <span className="stat-value profit">৳{(month.totalEarnings - month.totalCost).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Protected Route Info */}
      <div className="protected-route-info">
        <h2>Monthly Earnings (Protected Route)</h2>
        <p>This is a protected page. You can only see this if you're authenticated as an admin.</p>

        <button onClick={() => navigate("/dashboard")} className="back-button">
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}

export default MonthlyEarnings
