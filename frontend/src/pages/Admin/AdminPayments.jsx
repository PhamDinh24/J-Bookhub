import { useState, useEffect } from 'react'
import api from '../../services/api'
import { showSuccess, showError } from '../../utils/toastNotifications'
import '../../styles/Admin.css'

function AdminPayments() {
  const [payments, setPayments] = useState([])
  const [filteredPayments, setFilteredPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    method: '',
    status: '',
    searchId: ''
  })
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchPayments()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [payments, filters, dateRange])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const response = await api.get('/payments')
      setPayments(response.data || [])
    } catch (err) {
      console.error('Error fetching payments:', err)
      setPayments([])
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let result = [...payments]

    // Filter by method
    if (filters.method) {
      result = result.filter(p => p.paymentMethod === filters.method)
    }

    // Filter by status
    if (filters.status) {
      result = result.filter(p => p.status === filters.status)
    }

    // Search by transaction ID
    if (filters.searchId) {
      result = result.filter(p => 
        p.transactionId?.includes(filters.searchId) || 
        p.paymentId?.toString().includes(filters.searchId)
      )
    }

    // Filter by date range
    if (dateRange.startDate) {
      const startDate = new Date(dateRange.startDate)
      result = result.filter(p => new Date(p.paymentDate) >= startDate)
    }
    if (dateRange.endDate) {
      const endDate = new Date(dateRange.endDate)
      endDate.setHours(23, 59, 59, 999)
      result = result.filter(p => new Date(p.paymentDate) <= endDate)
    }

    setFilteredPayments(result)
    setCurrentPage(1)
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleDateChange = (e) => {
    const { name, value } = e.target
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleClearFilters = () => {
    setFilters({ method: '', status: '', searchId: '' })
    setDateRange({ startDate: '', endDate: '' })
  }

  const handleExport = () => {
    try {
      const csv = [
        ['ID', 'Đơn Hàng', 'Phương Thức', 'Số Tiền', 'Trạng Thái', 'Mã Giao Dịch', 'Ngày'],
        ...filteredPayments.map(p => [
          p.paymentId,
          p.orderId,
          p.paymentMethod,
          p.amount,
          p.status,
          p.transactionId || '',
          new Date(p.paymentDate).toLocaleDateString('vi-VN')
        ])
      ]
      
      const csvContent = csv.map(row => row.join(',')).join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `payments_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      showSuccess('✅ Xuất CSV thành công!')
    } catch (err) {
      showError('❌ Lỗi xuất CSV')
      console.error(err)
    }
  }

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage)
  const startIdx = (currentPage - 1) * itemsPerPage
  const paginatedPayments = filteredPayments.slice(startIdx, startIdx + itemsPerPage)

  if (loading) return <div className="loading">Đang tải...</div>

  return (
    <div className="admin-page">
      <h1>Quản Lý Thanh Toán</h1>

      <div className="filter-section">
        <div className="filter-row">
          <div className="filter-group">
            <label>Phương Thức</label>
            <select name="method" value={filters.method} onChange={handleFilterChange}>
              <option value="">-- Tất cả --</option>
              <option value="VNPay">VNPay</option>
              <option value="COD">COD</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Trạng Thái</label>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">-- Tất cả --</option>
              <option value="pending">Chờ xử lý</option>
              <option value="completed">Hoàn thành</option>
              <option value="failed">Thất bại</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Tìm Kiếm (ID/Mã GD)</label>
            <input 
              type="text" 
              name="searchId" 
              placeholder="Nhập ID hoặc mã giao dịch" 
              value={filters.searchId}
              onChange={handleFilterChange}
            />
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label>Từ Ngày</label>
            <input 
              type="date" 
              name="startDate" 
              value={dateRange.startDate}
              onChange={handleDateChange}
            />
          </div>

          <div className="filter-group">
            <label>Đến Ngày</label>
            <input 
              type="date" 
              name="endDate" 
              value={dateRange.endDate}
              onChange={handleDateChange}
            />
          </div>

          <div className="filter-group" style={{ minWidth: '200px' }}>
            <label>&nbsp;</label>
            <div className="filter-actions">
              <button className="btn-secondary" onClick={handleClearFilters}>Xóa Bộ Lọc</button>
              <button className="btn-csv" onClick={handleExport}>Xuất CSV</button>
            </div>
          </div>
        </div>
      </div>

      <div className="results-info">
        <p>Hiển thị {paginatedPayments.length} / {filteredPayments.length} kết quả</p>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Đơn Hàng</th>
              <th>Phương Thức</th>
              <th>Số Tiền</th>
              <th>Trạng Thái</th>
              <th>Mã Giao Dịch</th>
              <th>Ngày</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPayments.length === 0 ? (
              <tr><td colSpan="7" style={{textAlign: 'center'}}>Không có dữ liệu</td></tr>
            ) : (
              paginatedPayments.map(payment => (
                <tr key={payment.paymentId}>
                  <td><strong>#{payment.paymentId}</strong></td>
                  <td><strong>#{payment.orderId}</strong></td>
                  <td>{payment.paymentMethod}</td>
                  <td><strong>{payment.amount?.toLocaleString('vi-VN')} ₫</strong></td>
                  <td>
                    <span className={`status-badge status-${payment.status}`}>
                      {payment.status === 'completed' ? 'Hoàn thành' :
                       payment.status === 'pending' ? 'Chờ xử lý' :
                       payment.status === 'failed' ? 'Thất bại' : payment.status}
                    </span>
                  </td>
                  <td>{payment.transactionId || '—'}</td>
                  <td>{new Date(payment.paymentDate).toLocaleDateString('vi-VN')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            ← Trước
          </button>
          <span>Trang {currentPage} / {totalPages}</span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Sau →
          </button>
        </div>
      )}
    </div>
  )
}

export default AdminPayments
