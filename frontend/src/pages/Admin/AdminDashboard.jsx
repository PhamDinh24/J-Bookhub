import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import ExcelJS from 'exceljs'
import { Document, Packer, Table, TableRow, TableCell, Paragraph, AlignmentType } from 'docx'
import { showSuccess, showError } from '../../utils/toastNotifications'
import '../../styles/Admin.css'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler)

function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [topBooks, setTopBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState(null)
  const [filterType, setFilterType] = useState('week')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [filteredOrders, setFilteredOrders] = useState([])
  const [topBooksCount, setTopBooksCount] = useState(3)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    if (recentOrders.length > 0 || topBooks.length > 0) {
      generateChartData()
    }
  }, [recentOrders, topBooks, filteredOrders])

  const getDateRange = () => {
    const today = new Date()
    const start = new Date()
    
    switch (filterType) {
      case 'today':
        start.setHours(0, 0, 0, 0)
        return [start, today]
      case 'week':
        start.setDate(today.getDate() - 7)
        return [start, today]
      case 'month':
        start.setMonth(today.getMonth() - 1)
        return [start, today]
      case 'quarter':
        start.setMonth(today.getMonth() - 3)
        return [start, today]
      case 'year':
        start.setFullYear(today.getFullYear() - 1)
        return [start, today]
      case 'custom':
        return [new Date(startDate), new Date(endDate)]
      default:
        return [new Date(0), today]
    }
  }

  const filterOrdersByDate = () => {
    const [start, end] = getDateRange()
    const filtered = recentOrders.filter(order => {
      const orderDate = new Date(order.orderDate)
      return orderDate >= start && orderDate <= end
    })
    setFilteredOrders(filtered)
  }

  useEffect(() => {
    filterOrdersByDate()
  }, [filterType, startDate, endDate, recentOrders])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      const [statsRes, ordersRes, booksRes] = await Promise.all([
        fetch('http://localhost:8080/api/admin/dashboard/statistics'),
        fetch('http://localhost:8080/api/admin/dashboard/recent-orders'),
        fetch('http://localhost:8080/api/admin/dashboard/top-books')
      ])

      const statsData = await statsRes.json()
      const ordersData = await ordersRes.json()
      const booksData = await booksRes.json()

      setStats(statsData)
      setRecentOrders(ordersData)
      setTopBooks(booksData)
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  const generateChartData = () => {
    const ordersToUse = filteredOrders.length > 0 ? filteredOrders : recentOrders
    
    const dailyRevenueMap = {}
    ordersToUse.forEach(order => {
      const date = new Date(order.orderDate).toLocaleDateString('vi-VN')
      dailyRevenueMap[date] = (dailyRevenueMap[date] || 0) + (order.totalAmount || 0)
    })
    const dailyRevenue = Object.entries(dailyRevenueMap).map(([date, revenue]) => ({
      date,
      revenue: Math.round(revenue / 1000000) // Chuyển sang triệu đồng
    }))

    const dailyOrdersMap = {}
    ordersToUse.forEach(order => {
      const date = new Date(order.orderDate).toLocaleDateString('vi-VN')
      dailyOrdersMap[date] = (dailyOrdersMap[date] || 0) + 1
    })
    const dailyOrders = Object.entries(dailyOrdersMap).map(([date, count]) => ({
      date,
      count
    }))

    const categoryMap = {}
    topBooks.forEach(book => {
      const categoryName = book.category?.name || 'Khác'
      categoryMap[categoryName] = (categoryMap[categoryName] || 0) + 1
    })
    const topCategories = Object.entries(categoryMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    setChartData({
      dailyRevenue: dailyRevenue.length > 0 ? dailyRevenue : [{ date: 'N/A', revenue: 0 }],
      dailyOrders: dailyOrders.length > 0 ? dailyOrders : [{ date: 'N/A', count: 0 }],
      topCategories: topCategories.length > 0 ? topCategories : [{ name: 'Chưa có dữ liệu', count: 0 }]
    })
  }

  const exportToExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Báo Cáo Bán Sách')

      worksheet.columns = [
        { header: 'ID Đơn Hàng', key: 'orderId', width: 15 },
        { header: 'ID Người Dùng', key: 'userId', width: 15 },
        { header: 'Tổng Tiền (₫)', key: 'totalAmount', width: 18 },
        { header: 'Trạng Thái', key: 'status', width: 15 },
        { header: 'Ngày Đặt', key: 'orderDate', width: 18 }
      ]

      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
      worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF667eea' } }
      worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'center' }

      filteredOrders.forEach(order => {
        worksheet.addRow({
          orderId: order.orderId,
          userId: order.userId,
          totalAmount: order.totalAmount?.toLocaleString('vi-VN'),
          status: order.status,
          orderDate: new Date(order.orderDate).toLocaleDateString('vi-VN')
        })
      })

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          row.alignment = { horizontal: 'center', vertical: 'center' }
        }
      })

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bao-cao-ban-sach_${new Date().toISOString().split('T')[0]}.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)
      showSuccess('Xuất file Excel thành công!')
    } catch (err) {
      console.error('Error exporting to Excel:', err)
      showError('Lỗi xuất file Excel')
    }
  }

  const exportToWord = async () => {
    try {
      const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
      
      const rows = filteredOrders.map(order => 
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(order.orderId.toString())] }),
            new TableCell({ children: [new Paragraph(order.userId.toString())] }),
            new TableCell({ children: [new Paragraph(order.totalAmount?.toLocaleString('vi-VN') || '0')] }),
            new TableCell({ children: [new Paragraph(order.status)] }),
            new TableCell({ children: [new Paragraph(new Date(order.orderDate).toLocaleDateString('vi-VN'))] })
          ]
        })
      )

      const doc = new Document({
        sections: [{
          children: [
            new Paragraph({
              text: 'BÁO CÁO BÁN SÁCH J-BOOKHUB',
              bold: true,
              size: 32,
              alignment: AlignmentType.CENTER
            }),
            new Paragraph({
              text: `Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`,
              size: 20,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 }
            }),
            new Paragraph({
              text: `Tổng đơn hàng: ${filteredOrders.length} | Tổng doanh thu: ${totalRevenue.toLocaleString('vi-VN')} ₫`,
              size: 22,
              spacing: { after: 400 }
            }),
            new Table({
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ text: 'ID Đơn Hàng', bold: true })], shading: { fill: '667eea', color: 'auto' } }),
                    new TableCell({ children: [new Paragraph({ text: 'ID Người Dùng', bold: true })], shading: { fill: '667eea', color: 'auto' } }),
                    new TableCell({ children: [new Paragraph({ text: 'Tổng Tiền (₫)', bold: true })], shading: { fill: '667eea', color: 'auto' } }),
                    new TableCell({ children: [new Paragraph({ text: 'Trạng Thái', bold: true })], shading: { fill: '667eea', color: 'auto' } }),
                    new TableCell({ children: [new Paragraph({ text: 'Ngày Đặt', bold: true })], shading: { fill: '667eea', color: 'auto' } })
                  ]
                }),
                ...rows
              ],
              width: { size: 100, type: 'pct' }
            })
          ]
        }]
      })

      const blob = await Packer.toBlob(doc)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bao-cao-ban-sach_${new Date().toISOString().split('T')[0]}.docx`
      a.click()
      window.URL.revokeObjectURL(url)
      showSuccess('Xuất file Word thành công!')
    } catch (err) {
      console.error('Error exporting to Word:', err)
      showError('Lỗi xuất file Word')
    }
  }

  const exportToCSV = () => {
    try {
      const headers = ['ID Đơn Hàng', 'ID Người Dùng', 'Tổng Tiền (₫)', 'Trạng Thái', 'Ngày Đặt']
      const rows = filteredOrders.map(order => [
        order.orderId,
        order.userId,
        order.totalAmount,
        order.status,
        new Date(order.orderDate).toLocaleDateString('vi-VN')
      ])
      
      const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bao-cao-ban-sach_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      showSuccess('Xuất file CSV thành công!')
    } catch (err) {
      console.error('Error exporting to CSV:', err)
      showError('Lỗi xuất file CSV')
    }
  }

  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 9, weight: 'bold' },
          padding: 8,
          usePointStyle: true
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { font: { size: 8 } }
      },
      x: {
        ticks: { font: { size: 8 } }
      }
    }
  }

  const revenueChartData = {
    labels: chartData?.dailyRevenue?.map(item => item.date) || [],
    datasets: [
      {
        label: 'Doanh Thu (₫)',
        data: chartData?.dailyRevenue?.map(item => item.revenue) || [],
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.15)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: '#667eea',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }
    ]
  }

  const orderChartData = {
    labels: chartData?.dailyOrders?.map(item => item.date) || [],
    datasets: [
      {
        label: 'Số Đơn Hàng',
        data: chartData?.dailyOrders?.map(item => item.count) || [],
        backgroundColor: [
          'rgba(102, 126, 234, 0.8)',
          'rgba(118, 75, 162, 0.8)',
          'rgba(255, 193, 7, 0.8)',
          'rgba(244, 67, 54, 0.8)',
          'rgba(156, 39, 176, 0.8)',
          'rgba(33, 150, 243, 0.8)',
          'rgba(0, 188, 212, 0.8)'
        ],
        borderColor: [
          '#667eea',
          '#764ba2',
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
    labels: ['Đã Giao', 'Chờ Xử Lý', 'Đang Giao'],
    datasets: [
      {
        data: [
          stats?.orders?.completed || 0,
          stats?.orders?.pending || 0,
          (stats?.orders?.total || 0) - (stats?.orders?.completed || 0) - (stats?.orders?.pending || 0)
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(255, 193, 7, 0.8)',
          'rgba(59, 130, 246, 0.8)'
        ],
        borderColor: [
          '#10b981',
          '#fbc02d',
          '#3b82f6'
        ],
        borderWidth: 2
      }
    ]
  }

  const categoryChartData = {
    labels: chartData?.topCategories?.map(item => item.name) || [],
    datasets: [
      {
        label: 'Số Sách Bán',
        data: chartData?.topCategories?.map(item => item.count) || [],
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
    <div className="admin-dashboard">
      {/* Header with Date Range */}
      <div className="dashboard-header-new">
        <div className="header-left">
          <h1>Báo Cáo Bán Sách</h1>
        </div>
        <div className="header-right">
          <div className="date-range-picker">
            <div className="date-input-group">
              <label>Từ ngày</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="date-input-group">
              <label>Đến ngày</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <button className="btn-filter-apply" onClick={filterOrdersByDate}>Lọc dữ liệu</button>
          </div>
        </div>
      </div>

      {/* Main Stats - 3 Large Cards */}
      <div className="stats-grid-main">
        <div className="stat-card-main">
          <div className="stat-card-icon">💰</div>
          <div className="stat-card-content">
            <h3>Tổng Doanh Thu</h3>
            <p className="stat-card-number">{(stats?.revenue?.total || 0).toLocaleString('vi-VN')} ₫</p>
          </div>
        </div>

        <div className="stat-card-main">
          <div className="stat-card-icon">📦</div>
          <div className="stat-card-content">
            <h3>Số Đơn Hàng</h3>
            <p className="stat-card-number">{stats?.orders?.total || 0}</p>
          </div>
        </div>

        <div className="stat-card-main">
          <div className="stat-card-icon">📖</div>
          <div className="stat-card-content">
            <h3>Tổng Sách Bán</h3>
            <p className="stat-card-number">{stats?.books?.total || 0}</p>
          </div>
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="charts-section-main">
        <div className="chart-container-main">
          <div className="chart-header">
            <h2>Thống Kê Đơn Hàng Theo Ngày</h2>
            <div className="chart-actions">
              <button className="btn-chart-action btn-red" onClick={exportToWord}>Xuất Word</button>
              <button className="btn-chart-action btn-green" onClick={exportToExcel}>Xuất Excel</button>
            </div>
          </div>
          <Bar data={orderChartData} options={chartOptions} />
        </div>
      </div>

      {/* Top Books Grid */}
      <div className="top-books-section">
        <div className="section-header">
          <h2>Sách Bán Chạy Nhất</h2>
          <div className="section-tabs">
            <button 
              className={`tab-btn ${topBooksCount === 3 ? 'active' : ''}`}
              onClick={() => setTopBooksCount(3)}
            >
              Top 3
            </button>
            <button 
              className={`tab-btn ${topBooksCount === 5 ? 'active' : ''}`}
              onClick={() => setTopBooksCount(5)}
            >
              Top 5
            </button>
            <button 
              className={`tab-btn ${topBooksCount === 10 ? 'active' : ''}`}
              onClick={() => setTopBooksCount(10)}
            >
              Top 10
            </button>
          </div>
        </div>
        <div className="books-grid-main">
          {topBooks.slice(0, topBooksCount).map((book, index) => (
            <div key={book.bookId} className="book-card-main">
              <div className="book-rank-badge">Top {index + 1}</div>
              <div className="book-image-placeholder">
                <img src={book.coverImageUrl || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="280"%3E%3Crect fill="%23ddd" width="200" height="280"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="14" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E'} alt={book.title} />
              </div>
              <div className="book-card-info">
                <h4>{book.title}</h4>
                <p className="book-author">{book.author?.name || 'Tác giả'}</p>
                <div className="book-stats-main">
                  <div className="stat-item">
                    <span className="stat-label">Bán</span>
                    <span className="stat-val">{book.soldQuantity || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Giá</span>
                    <span className="stat-val">{(book.price || 0).toLocaleString('vi-VN')}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Charts */}
      <div className="charts-section-bottom">
        <div className="chart-container-main">
          <h2>Xu Hướng Doanh Thu</h2>
          <Line data={revenueChartData} options={chartOptions} />
        </div>

        <div className="chart-container-main">
          <h2>Trạng Thái Đơn Hàng</h2>
          <Doughnut data={statusChartData} options={chartOptions} />
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

