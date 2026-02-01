import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import ExcelJS from 'exceljs'
import { Document, Packer, Table, TableRow, TableCell, Paragraph, AlignmentType } from 'docx'
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
      revenue
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
      const worksheet = workbook.addWorksheet('Báo Cáo')

      worksheet.columns = [
        { header: 'ID Đơn Hàng', key: 'orderId', width: 15 },
        { header: 'ID Người Dùng', key: 'userId', width: 15 },
        { header: 'Tổng Tiền (VND)', key: 'totalAmount', width: 18 },
        { header: 'Trạng Thái', key: 'status', width: 15 },
        { header: 'Ngày Đặt', key: 'orderDate', width: 18 }
      ]

      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
      worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1e3c72' } }
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
      a.download = `report_${new Date().toISOString().split('T')[0]}.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error exporting to Excel:', err)
      alert('Lỗi xuất file Excel')
    }
  }

  const exportToWord = async () => {
    try {
      const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
      
      const rows = filteredOrders.map(order => [
        new TableCell({ children: [new Paragraph(order.orderId.toString())] }),
        new TableCell({ children: [new Paragraph(order.userId.toString())] }),
        new TableCell({ children: [new Paragraph(order.totalAmount?.toLocaleString('vi-VN') || '0')] }),
        new TableCell({ children: [new Paragraph(order.status)] }),
        new TableCell({ children: [new Paragraph(new Date(order.orderDate).toLocaleDateString('vi-VN'))] })
      ])

      const doc = new Document({
        sections: [{
          children: [
            new Paragraph({
              text: 'BÁO CÁO THỐNG KÊ BOOKSTORE',
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
                    new TableCell({ children: [new Paragraph({ text: 'ID Đơn Hàng', bold: true })], shading: { fill: '1e3c72', color: 'auto' } }),
                    new TableCell({ children: [new Paragraph({ text: 'ID Người Dùng', bold: true })], shading: { fill: '1e3c72', color: 'auto' } }),
                    new TableCell({ children: [new Paragraph({ text: 'Tổng Tiền (VND)', bold: true })], shading: { fill: '1e3c72', color: 'auto' } }),
                    new TableCell({ children: [new Paragraph({ text: 'Trạng Thái', bold: true })], shading: { fill: '1e3c72', color: 'auto' } }),
                    new TableCell({ children: [new Paragraph({ text: 'Ngày Đặt', bold: true })], shading: { fill: '1e3c72', color: 'auto' } })
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
      a.download = `report_${new Date().toISOString().split('T')[0]}.docx`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error exporting to Word:', err)
      alert('Lỗi xuất file Word')
    }
  }

  const exportToCSV = () => {
    const headers = ['ID Đơn Hàng', 'ID Người Dùng', 'Tổng Tiền (VND)', 'Trạng Thái', 'Ngày Đặt']
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
    a.download = `report_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return <div className="loading">⏳ Đang tải dữ liệu...</div>
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 10, weight: 'bold' },
          padding: 10,
          usePointStyle: true
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { font: { size: 9 } }
      },
      x: {
        ticks: { font: { size: 9 } }
      }
    }
  }

  const revenueChartData = {
    labels: chartData?.dailyRevenue?.map(item => item.date) || [],
    datasets: [
      {
        label: 'Doanh Thu (VND)',
        data: chartData?.dailyRevenue?.map(item => item.revenue) || [],
        borderColor: '#4fc3f7',
        backgroundColor: 'rgba(79, 195, 247, 0.15)',
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
    labels: chartData?.dailyOrders?.map(item => item.date) || [],
    datasets: [
      {
        label: 'Số Đơn Hàng',
        data: chartData?.dailyOrders?.map(item => item.count) || [],
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
          stats?.orders?.completed || 0,
          stats?.orders?.pending || 0,
          (stats?.orders?.total || 0) - (stats?.orders?.completed || 0) - (stats?.orders?.pending || 0)
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
      <div className="dashboard-header">
        <h1>📊 Bảng Điều Khiển</h1>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filterType === 'today' ? 'active' : ''}`}
            onClick={() => setFilterType('today')}
          >
            � Hôm Nay
          </button>
          <button 
            className={`filter-btn ${filterType === 'week' ? 'active' : ''}`}
            onClick={() => setFilterType('week')}
          >
            📊 7 Ngày
          </button>
          <button 
            className={`filter-btn ${filterType === 'month' ? 'active' : ''}`}
            onClick={() => setFilterType('month')}
          >
            📈 1 Tháng
          </button>
          <button 
            className={`filter-btn ${filterType === 'quarter' ? 'active' : ''}`}
            onClick={() => setFilterType('quarter')}
          >
            📉 1 Quý
          </button>
          <button 
            className={`filter-btn ${filterType === 'year' ? 'active' : ''}`}
            onClick={() => setFilterType('year')}
          >
            📋 1 Năm
          </button>
          <button 
            className={`filter-btn ${filterType === 'custom' ? 'active' : ''}`}
            onClick={() => setFilterType('custom')}
          >
            � Tùy Chỉnh
          </button>
        </div>

        {filterType === 'custom' && (
          <div className="custom-date-range">
            <input 
              type="date" 
              className="date-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="date-separator">→</span>
            <input 
              type="date" 
              className="date-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        )}

        <div className="export-buttons">
          <button className="btn-export btn-excel" onClick={exportToExcel} title="Xuất Excel">
            📊 Excel
          </button>
          <button className="btn-export btn-word" onClick={exportToWord} title="Xuất Word">
            📄 Word
          </button>
          <button className="btn-export btn-csv" onClick={exportToCSV} title="Xuất CSV">
            � CSV
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Người Dùng</h3>
            <p className="stat-number">{stats?.users?.total || 0}</p>
            <small>� Khách: {stats?.users?.customers || 0}</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3>Sách</h3>
            <p className="stat-number">{stats?.books?.total || 0}</p>
            <small>📖 Tổng số sách</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Đơn Hàng</h3>
            <p className="stat-number">{stats?.orders?.total || 0}</p>
            <small>⏳ Chờ: {stats?.orders?.pending || 0}</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Doanh Thu</h3>
            <p className="stat-number">{(stats?.revenue?.total || 0).toLocaleString('vi-VN')}</p>
            <small>� VND</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>Đánh Giá</h3>
            <p className="stat-number">{stats?.reviews?.averageRating || 0}</p>
            <small>📊 {stats?.reviews?.total || 0} đánh giá</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Thanh Toán</h3>
            <p className="stat-number">{stats?.payments?.completed || 0}</p>
            <small>💳 Hoàn thành</small>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <h2>� Biểu Đồ Thống Kê</h2>
        <div className="charts-grid">
          <div className="chart-container">
            <h3>📈 Doanh Thu</h3>
            <Line data={revenueChartData} options={chartOptions} />
          </div>

          <div className="chart-container">
            <h3>📊 Đơn Hàng</h3>
            <Bar data={orderChartData} options={chartOptions} />
          </div>

          <div className="chart-container">
            <h3>🎯 Trạng Thái Đơn Hàng</h3>
            <Doughnut data={statusChartData} options={chartOptions} />
          </div>

          <div className="chart-container">
            <h3>🏆 Danh Mục Bán Chạy</h3>
            <Bar data={categoryChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Management Links */}
      <div className="management-section">
        <h2>🔧 Quản Lý Hệ Thống</h2>
        <div className="management-grid">
          <Link to="/admin/books" className="management-card">
            <span className="icon">�</span>
            <h3>Quản Lý Sách</h3>
            <p>Thêm, sửa, xóa sách</p>
          </Link>

          <Link to="/admin/categories" className="management-card">
            <span className="icon">🏷️</span>
            <h3>Quản Lý Danh Mục</h3>
            <p>Quản lý danh mục sách</p>
          </Link>

          <Link to="/admin/authors" className="management-card">
            <span className="icon">✍️</span>
            <h3>Quản Lý Tác Giả</h3>
            <p>Quản lý thông tin tác giả</p>
          </Link>

          <Link to="/admin/publishers" className="management-card">
            <span className="icon">🏢</span>
            <h3>Quản Lý NXB</h3>
            <p>Quản lý nhà xuất bản</p>
          </Link>

          <Link to="/admin/users" className="management-card">
            <span className="icon">👤</span>
            <h3>Quản Lý Người Dùng</h3>
            <p>Quản lý tài khoản khách hàng</p>
          </Link>

          <Link to="/admin/orders" className="management-card">
            <span className="icon">📦</span>
            <h3>Quản Lý Đơn Hàng</h3>
            <p>Xem và cập nhật đơn hàng</p>
          </Link>

          <Link to="/admin/payments" className="management-card">
            <span className="icon">💳</span>
            <h3>Quản Lý Thanh Toán</h3>
            <p>Xem lịch sử thanh toán</p>
          </Link>

          <Link to="/admin/reviews" className="management-card">
            <span className="icon">⭐</span>
            <h3>Quản Lý Đánh Giá</h3>
            <p>Xem và quản lý đánh giá</p>
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="recent-section">
        <h2>� Đơn Hàng Gần Đây</h2>
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Người Dùng</th>
                <th>Tổng Tiền</th>
                <th>Trạng Thái</th>
                <th>Ngày</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.slice(0, 5).map(order => (
                <tr key={order.orderId}>
                  <td><strong>#{order.orderId}</strong></td>
                  <td>User {order.userId}</td>
                  <td><strong>{order.totalAmount?.toLocaleString('vi-VN')} ₫</strong></td>
                  <td>
                    <span className={`status-badge status-${order.status}`}>
                      {order.status === 'pending' ? '⏳ Chờ xử lý' : 
                       order.status === 'completed' ? '✅ Hoàn thành' :
                       order.status === 'shipped' ? '🚚 Đã gửi' : order.status}
                    </span>
                  </td>
                  <td>{new Date(order.orderDate).toLocaleDateString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Books */}
      <div className="top-books-section">
        <h2>🔥 Sách Bán Chạy</h2>
        <div className="books-list">
          {topBooks.slice(0, 5).map((book, index) => (
            <div key={book.bookId} className="book-item">
              <span className="rank">{index + 1}</span>
              <div className="book-info">
                <h4>{book.title}</h4>
                <p>📦 Kho: {book.stockQuantity} | 💵 Giá: {book.price?.toLocaleString('vi-VN')} ₫</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
