import { useState, useEffect } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import '../../styles/Admin.css'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler)

function AdminReports() {
  const [dateRange, setDateRange] = useState('month')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setDefaultDateRange('month')
  }, [])

  const setDefaultDateRange = (range) => {
    const today = new Date()
    let start = new Date()

    switch (range) {
      case 'day':
        start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        break
      case 'week':
        start = new Date(today.setDate(today.getDate() - today.getDay()))
        break
      case 'month':
        start = new Date(today.getFullYear(), today.getMonth(), 1)
        break
      case 'quarter':
        const quarter = Math.floor(today.getMonth() / 3)
        start = new Date(today.getFullYear(), quarter * 3, 1)
        break
      case 'year':
        start = new Date(today.getFullYear(), 0, 1)
        break
      default:
        break
    }

    setStartDate(start.toISOString().split('T')[0])
    setEndDate(new Date().toISOString().split('T')[0])
    setDateRange(range)
    fetchReportData(start.toISOString().split('T')[0], new Date().toISOString().split('T')[0])
  }

  const fetchReportData = async (start, end) => {
    try {
      setLoading(true)
      setError('')
      const response = await fetch(`http://localhost:8080/api/admin/reports?startDate=${start}&endDate=${end}`)
      if (!response.ok) {
        throw new Error('Lỗi tải báo cáo')
      }
      const data = await response.json()
      setReportData(data)
    } catch (err) {
      console.error('Error fetching report data:', err)
      setError('Không thể tải dữ liệu báo cáo. Vui lòng thử lại.')
      // Set mock data for demo
      setReportData(getMockData())
    } finally {
      setLoading(false)
    }
  }

  const getMockData = () => ({
    totalRevenue: 50000000,
    totalOrders: 150,
    totalUsers: 45,
    totalBooks: 200,
    completedOrders: 120,
    pendingOrders: 20,
    shippedOrders: 10,
    dailyRevenue: [
      { date: '01/01/2024', revenue: 2000000 },
      { date: '02/01/2024', revenue: 2500000 },
      { date: '03/01/2024', revenue: 1800000 },
      { date: '04/01/2024', revenue: 3200000 },
      { date: '05/01/2024', revenue: 2800000 }
    ],
    dailyOrders: [
      { date: '01/01/2024', count: 5 },
      { date: '02/01/2024', count: 8 },
      { date: '03/01/2024', count: 4 },
      { date: '04/01/2024', count: 10 },
      { date: '05/01/2024', count: 7 }
    ],
    topCategories: [
      { name: 'Tiểu thuyết', count: 45 },
      { name: 'Khoa học', count: 32 },
      { name: 'Lịch sử', count: 28 },
      { name: 'Tự giúp', count: 25 },
      { name: 'Trẻ em', count: 20 }
    ]
  })

  const handleCustomDateRange = () => {
    if (startDate && endDate) {
      fetchReportData(startDate, endDate)
    }
  }

  const exportToCSV = () => {
    if (!reportData) return

    let csv = 'Báo Cáo Kinh Doanh\n'
    csv += `Từ: ${startDate} đến ${endDate}\n\n`

    csv += 'Thống Kê Chung\n'
    csv += `Tổng Doanh Thu,${reportData.totalRevenue}\n`
    csv += `Tổng Đơn Hàng,${reportData.totalOrders}\n`
    csv += `Tổng Người Dùng,${reportData.totalUsers}\n`
    csv += `Tổng Sách,${reportData.totalBooks}\n\n`

    csv += 'Doanh Thu Theo Ngày\n'
    csv += 'Ngày,Doanh Thu\n'
    reportData.dailyRevenue?.forEach(item => {
      csv += `${item.date},${item.revenue}\n`
    })

    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv))
    element.setAttribute('download', `report_${startDate}_${endDate}.csv`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  if (loading) return <div className="loading">Đang tải báo cáo...</div>

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 12, weight: 'bold' },
          padding: 15,
          usePointStyle: true
        }
      },
      title: {
        display: true,
        font: { size: 14, weight: 'bold' }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { font: { size: 11 } }
      },
      x: {
        ticks: { font: { size: 11 } }
      }
    }
  }

  const revenueChartData = {
    labels: reportData?.dailyRevenue?.map(item => item.date) || [],
    datasets: [
      {
        label: 'Doanh Thu (VND)',
        data: reportData?.dailyRevenue?.map(item => item.revenue) || [],
        borderColor: '#4fc3f7',
        backgroundColor: 'rgba(79, 195, 247, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: '#4fc3f7',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }
    ]
  }

  const orderChartData = {
    labels: reportData?.dailyOrders?.map(item => item.date) || [],
    datasets: [
      {
        label: 'Số Đơn Hàng',
        data: reportData?.dailyOrders?.map(item => item.count) || [],
        backgroundColor: [
          'rgba(79, 195, 247, 0.8)',
          'rgba(76, 175, 80, 0.8)',
          'rgba(255, 193, 7, 0.8)',
          'rgba(244, 67, 54, 0.8)',
          'rgba(156, 39, 176, 0.8)',
          'rgba(33, 150, 243, 0.8)',
          'rgba(0, 188, 212, 0.8)'
        ],
        borderColor: [
          '#29b6f6',
          '#4caf50',
          '#fbc02d',
          '#ef5350',
          '#ab47bc',
          '#1976d2',
          '#00acc1'
        ],
        borderWidth: 2
      }
    ]
  }

  const statusChartData = {
    labels: ['Hoàn Thành', 'Chờ Xử Lý', 'Đã Gửi'],
    datasets: [
      {
        data: [
          reportData?.completedOrders || 0,
          reportData?.pendingOrders || 0,
          reportData?.shippedOrders || 0
        ],
        backgroundColor: [
          'rgba(76, 175, 80, 0.8)',
          'rgba(255, 193, 7, 0.8)',
          'rgba(33, 150, 243, 0.8)'
        ],
        borderColor: [
          '#4caf50',
          '#fbc02d',
          '#1976d2'
        ],
        borderWidth: 2
      }
    ]
  }

  const categoryChartData = {
    labels: reportData?.topCategories?.map(item => item.name) || [],
    datasets: [
      {
        label: 'Số Sách Bán',
        data: reportData?.topCategories?.map(item => item.count) || [],
        backgroundColor: [
          'rgba(79, 195, 247, 0.8)',
          'rgba(76, 175, 80, 0.8)',
          'rgba(255, 193, 7, 0.8)',
          'rgba(244, 67, 54, 0.8)',
          'rgba(156, 39, 176, 0.8)'
        ],
        borderColor: [
          '#29b6f6',
          '#4caf50',
          '#fbc02d',
          '#ef5350',
          '#ab47bc'
        ],
        borderWidth: 2
      }
    ]
  }

  return (
    <div className="admin-page">
      <h1>Báo Cáo & Thống Kê</h1>

      {error && (
        <div className="error-message" style={{ marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Date Range Filter */}
      <div className="report-filters">
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${dateRange === 'day' ? 'active' : ''}`}
            onClick={() => setDefaultDateRange('day')}
          >
            📅 Hôm Nay
          </button>
          <button 
            className={`filter-btn ${dateRange === 'week' ? 'active' : ''}`}
            onClick={() => setDefaultDateRange('week')}
          >
            📆 Tuần
          </button>
          <button 
            className={`filter-btn ${dateRange === 'month' ? 'active' : ''}`}
            onClick={() => setDefaultDateRange('month')}
          >
            Tháng
          </button>
          <button 
            className={`filter-btn ${dateRange === 'quarter' ? 'active' : ''}`}
            onClick={() => setDefaultDateRange('quarter')}
          >
            Quý
          </button>
          <button 
            className={`filter-btn ${dateRange === 'year' ? 'active' : ''}`}
            onClick={() => setDefaultDateRange('year')}
          >
            Năm
          </button>
        </div>

        <div className="custom-date-range">
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="date-input"
          />
          <span className="date-separator">→</span>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="date-input"
          />
          <button className="btn btn-primary" onClick={handleCustomDateRange}>
            🔍 Tìm Kiếm
          </button>
          <button className="btn btn-primary" onClick={exportToCSV}>
            📥 Xuất CSV
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {reportData && (
        <div className="report-summary">
          <div className="summary-card">
            <h3>💰 Tổng Doanh Thu</h3>
            <p className="summary-value">{reportData.totalRevenue?.toLocaleString('vi-VN')} ₫</p>
          </div>
          <div className="summary-card">
            <h3>Tổng Đơn Hàng</h3>
            <p className="summary-value">{reportData.totalOrders}</p>
          </div>
          <div className="summary-card">
            <h3>Tổng Người Dùng</h3>
            <p className="summary-value">{reportData.totalUsers}</p>
          </div>
          <div className="summary-card">
            <h3>Tổng Sách</h3>
            <p className="summary-value">{reportData.totalBooks}</p>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-container">
          <h2>Doanh Thu Theo Ngày</h2>
          <Line data={revenueChartData} options={chartOptions} />
        </div>

        <div className="chart-container">
          <h2>Đơn Hàng Theo Ngày</h2>
          <Bar data={orderChartData} options={chartOptions} />
        </div>

        <div className="chart-container">
          <h2>Trạng Thái Đơn Hàng</h2>
          <Doughnut data={statusChartData} options={chartOptions} />
        </div>

        <div className="chart-container">
          <h2>🏆 Danh Mục Bán Chạy</h2>
          <Bar data={categoryChartData} options={chartOptions} />
        </div>
      </div>
    </div>
  )
}

export default AdminReports
