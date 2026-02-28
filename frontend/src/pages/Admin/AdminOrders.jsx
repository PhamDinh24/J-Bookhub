import { useState, useEffect } from 'react'
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal'
import api from '../../services/api'
import { showSuccess, showError } from '../../utils/toastNotifications'

function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderDetails, setOrderDetails] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [formData, setFormData] = useState({
    status: 'pending'
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [orders, searchTerm, statusFilter, dateRange])

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders')
      setOrders(response.data)
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError('Lỗi tải danh sách đơn hàng')
    }
  }

  const applyFilters = () => {
    let result = [...orders]

    if (searchTerm) {
      result = result.filter(order =>
        order.orderId?.toString().includes(searchTerm) ||
        order.userId?.toString().includes(searchTerm)
      )
    }

    if (statusFilter) {
      result = result.filter(order => order.status === statusFilter)
    }

    if (dateRange.startDate) {
      const startDate = new Date(dateRange.startDate)
      result = result.filter(order => new Date(order.orderDate) >= startDate)
    }

    if (dateRange.endDate) {
      const endDate = new Date(dateRange.endDate)
      endDate.setHours(23, 59, 59, 999)
      result = result.filter(order => new Date(order.orderDate) <= endDate)
    }

    setFilteredOrders(result)
    setCurrentPage(1)
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value)
  }

  const handleDateChange = (e) => {
    const { name, value } = e.target
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setStatusFilter('')
    setDateRange({ startDate: '', endDate: '' })
  }

  const handleEditOrder = (order) => {
    setEditingId(order.orderId)
    setFormData({
      status: order.status || 'pending'
    })
    setMessage('')
    setError('')
    setShowModal(true)
  }

  const handleViewDetails = async (order) => {
    setSelectedOrder(order)
    try {
      const response = await api.get(`/orders/${order.orderId}/details`)
      // Response now includes items array
      if (response.data && response.data.items) {
        setOrderDetails(response.data.items)
      } else {
        setOrderDetails([])
      }
    } catch (err) {
      console.error('Error fetching order details:', err)
      setOrderDetails([])
    }
    setShowDetailsModal(true)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const orderData = {
        status: formData.status
      }

      await api.put(`/orders/${editingId}`, orderData)
      showSuccess('✅ Cập nhật đơn hàng thành công!')
      setMessage('Cập nhật đơn hàng thành công!')
      setShowModal(false)
      fetchOrders()
      setTimeout(() => setMessage(''), 2000)
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Lỗi cập nhật đơn hàng. Vui lòng thử lại.'
      setError(errorMsg)
      showError('❌ ' + errorMsg)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteOrder = (orderId) => {
    const order = orders.find(o => o.orderId === orderId)
    setDeleteTarget({ id: orderId, title: `Đơn hàng #${order?.orderId || orderId}` })
    setShowDeleteConfirm(true)
  }

  const confirmDeleteOrder = async () => {
    if (!deleteTarget) return
    try {
      await api.delete(`/orders/${deleteTarget.id}`)
      showSuccess('✅ Xóa đơn hàng thành công!')
      setMessage('Xóa đơn hàng thành công!')
      setShowDeleteConfirm(false)
      setDeleteTarget(null)
      fetchOrders()
      setTimeout(() => setMessage(''), 2000)
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Lỗi xóa đơn hàng'
      setError(errorMsg)
      showError('❌ ' + errorMsg)
      console.error(err)
    }
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': { label: '⏳ Chờ xử lý', class: 'status-pending' },
      'confirmed': { label: '✅ Đã xác nhận', class: 'status-confirmed' },
      'shipped': { label: '📦 Đang giao', class: 'status-shipped' },
      'delivered': { label: '🎉 Đã giao', class: 'status-delivered' },
      'cancelled': { label: '❌ Đã hủy', class: 'status-cancelled' }
    }
    const info = statusMap[status] || { label: status, class: 'status-unknown' }
    return <span className={`status-badge ${info.class}`}>{info.label}</span>
  }

  return (
    <div className="admin-page">
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <h1>Quản Lý Đơn Hàng</h1>

      <div className="filter-section">
        <div className="filter-row">
          <div className="filter-group" style={{ flex: 1 }}>
            <label>Tìm Kiếm</label>
            <input 
              type="text" 
              placeholder="Tìm theo ID đơn hàng hoặc ID người dùng..." 
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="filter-group">
            <label>Trạng Thái</label>
            <select value={statusFilter} onChange={handleStatusFilterChange}>
              <option value="">-- Tất cả --</option>
              <option value="pending">Chờ xử lý</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="shipped">Đang giao</option>
              <option value="delivered">Đã giao</option>
              <option value="cancelled">Đã hủy</option>
            </select>
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
          <div className="filter-actions" style={{ alignItems: 'flex-end' }}>
            <button className="btn-secondary" onClick={handleClearFilters}>Xóa Bộ Lọc</button>
          </div>
        </div>
      </div>

      <div className="results-info">
        <p>Hiển thị {filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).length} / {filteredOrders.length} kết quả</p>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Người Dùng</th>
              <th>Tổng Tiền</th>
              <th>Trạng Thái</th>
              <th>Ngày Tạo</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr><td colSpan="6" style={{textAlign: 'center'}}>Không có dữ liệu</td></tr>
            ) : (
              filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(order => (
                <tr key={order.orderId}>
                  <td>#{order.orderId}</td>
                  <td>{order.userId}</td>
                  <td>{order.totalAmount?.toLocaleString()} VND</td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-view" title="Xem" onClick={() => handleViewDetails(order)}>👁️</button>
                      <button className="btn-edit" title="Sửa" onClick={() => handleEditOrder(order)}>✏️</button>
                      <button className="btn-delete" title="Xóa" onClick={() => handleDeleteOrder(order.orderId)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {orders.length > 0 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            ← Trước
          </button>
          <span>Trang {currentPage} / {Math.ceil(filteredOrders.length / itemsPerPage)}</span>
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredOrders.length / itemsPerPage)))}
            disabled={currentPage === Math.ceil(filteredOrders.length / itemsPerPage)}
          >
            Sau →
          </button>
        </div>
      )}

      {showModal && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Cập Nhật Trạng Thái Đơn Hàng</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form className="modal-form" onSubmit={handleSave}>
              {message && <div className="success-message">{message}</div>}
              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label>Trạng Thái</label>
                <select 
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="pending">⏳ Chờ xử lý</option>
                  <option value="confirmed">✅ Đã xác nhận</option>
                  <option value="shipped">📦 Đang giao</option>
                  <option value="delivered">🎉 Đã giao</option>
                  <option value="cancelled">❌ Đã hủy</option>
                </select>
              </div>

              <div className="modal-buttons">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn-save" disabled={loading}>
                  {loading ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailsModal && selectedOrder && (
        <div className="modal active">
          <div className="modal-content modal-large">
            <div className="modal-header">
              <h2>Chi Tiết Đơn Hàng #{selectedOrder.orderId}</h2>
              <button className="close-btn" onClick={() => setShowDetailsModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="order-info">
                <div className="info-row">
                  <span className="label">ID Đơn Hàng:</span>
                  <span className="value">#{selectedOrder.orderId}</span>
                </div>
                <div className="info-row">
                  <span className="label">Người Dùng:</span>
                  <span className="value">User {selectedOrder.userId}</span>
                </div>
                <div className="info-row">
                  <span className="label">Tổng Tiền:</span>
                  <span className="value" style={{fontWeight: 900, color: '#667eea', fontSize: '1.1rem'}}>
                    {selectedOrder.totalAmount?.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Trạng Thái:</span>
                  <span className="value">{getStatusBadge(selectedOrder.status)}</span>
                </div>
                <div className="info-row">
                  <span className="label">Địa Chỉ Giao Hàng:</span>
                  <span className="value">{selectedOrder.shippingAddress || 'Chưa cập nhật'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Ngày Tạo:</span>
                  <span className="value">{new Date(selectedOrder.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>

              <h3 style={{marginTop: '2rem', marginBottom: '1.2rem', color: '#1a1a2e', fontWeight: 900, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Sách Trong Đơn Hàng</h3>
              {orderDetails && orderDetails.length > 0 ? (
                <table className="details-table">
                  <thead>
                    <tr>
                      <th>Tên Sách</th>
                      <th>Số Lượng</th>
                      <th>Giá</th>
                      <th>Tổng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderDetails.map((detail, idx) => (
                      <tr key={idx}>
                        <td>{detail.bookTitle || detail.book?.title || '-'}</td>
                        <td style={{textAlign: 'center'}}>{detail.quantity}</td>
                        <td style={{textAlign: 'right'}}>{detail.price?.toLocaleString('vi-VN')} ₫</td>
                        <td style={{textAlign: 'right', fontWeight: 700}}>{(detail.quantity * detail.price)?.toLocaleString('vi-VN')} ₫</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{textAlign: 'center', padding: '2rem', background: '#f8f9fc', borderRadius: '10px', color: '#999', fontWeight: 600}}>
                  Không có chi tiết đơn hàng
                </div>
              )}

              <div className="modal-buttons" style={{marginTop: '2rem'}}>
                <button type="button" className="btn-cancel" onClick={() => setShowDetailsModal(false)}>Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        title={deleteTarget?.title}
        message="Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa?"
        onConfirm={confirmDeleteOrder}
        onCancel={() => {
          setShowDeleteConfirm(false)
          setDeleteTarget(null)
        }}
        isLoading={false}
      />
    </div>
  )
}

export default AdminOrders
