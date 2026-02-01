import { useState, useEffect } from 'react'
import api from '../../services/api'

function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    status: 'pending'
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders')
      setOrders(response.data)
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError('Lỗi tải danh sách đơn hàng')
    }
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
      setMessage('Cập nhật đơn hàng thành công!')
      setShowModal(false)
      fetchOrders()
      setTimeout(() => setMessage(''), 2000)
    } catch (err) {
      setError('Lỗi cập nhật đơn hàng. Vui lòng thử lại.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
      try {
        await api.delete(`/orders/${orderId}`)
        setMessage('Xóa đơn hàng thành công!')
        fetchOrders()
        setTimeout(() => setMessage(''), 2000)
      } catch (err) {
        setError('Lỗi xóa đơn hàng')
        console.error(err)
      }
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
    <div>
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="admin-header">
        <h1>Quản Lý Đơn Hàng</h1>
      </div>

      <div className="admin-table">
        <table>
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
            {orders.length === 0 ? (
              <tr><td colSpan="6" style={{textAlign: 'center'}}>Không có dữ liệu</td></tr>
            ) : (
              orders.map(order => (
                <tr key={order.orderId}>
                  <td>#{order.orderId}</td>
                  <td>{order.userId}</td>
                  <td>{order.totalAmount?.toLocaleString()} VND</td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <button className="btn-edit" onClick={() => handleEditOrder(order)}>Sửa</button>
                    <button className="btn-delete" onClick={() => handleDeleteOrder(order.orderId)}>Xóa</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
    </div>
  )
}

export default AdminOrders
