import { useState, useEffect } from 'react'
import orderService from '../services/orderService'
import './OrderDetailModal.css'

function OrderDetailModal({ orderId, onClose }) {
  const [orderDetails, setOrderDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchOrderDetails()
  }, [orderId])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      const response = await orderService.getOrderDetails(orderId)
      setOrderDetails(response.data)
      setError(null)
    } catch (err) {
      console.error('Lỗi khi tải chi tiết đơn hàng:', err)
      setError('Không thể tải chi tiết đơn hàng')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Đang tải...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !orderDetails) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <p className="error-message">{error || 'Không tìm thấy đơn hàng'}</p>
            <button className="btn btn-primary" onClick={onClose}>Đóng</button>
          </div>
        </div>
      </div>
    )
  }

  const totalAmount = orderDetails.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#FFA500',
      'processing': '#2196F3',
      'shipped': '#00BCD4',
      'delivered': '#4CAF50',
      'cancelled': '#F44336'
    }
    return colors[status] || '#999'
  }

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'Chờ xử lý',
      'processing': 'Đang xử lý',
      'shipped': 'Đã gửi',
      'delivered': 'Đã giao',
      'cancelled': 'Đã hủy'
    }
    return labels[status] || status
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-title">
            <h2>Đơn Hàng #{orderDetails.orderId}</h2>
            <span 
              className="status-badge"
              style={{ backgroundColor: getStatusColor(orderDetails.status) }}
            >
              {getStatusLabel(orderDetails.status)}
            </span>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Order Info */}
          <section className="order-section">
            <h3 className="section-title">Thông Tin Đơn Hàng</h3>
            <div className="info-grid">
              <div className="info-card">
                <span className="info-label">Ngày Đặt</span>
                <span className="info-value">
                  {new Date(orderDetails.orderDate).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="info-card">
                <span className="info-label">Địa Chỉ Giao Hàng</span>
                <span className="info-value">{orderDetails.shippingAddress}</span>
              </div>
            </div>
          </section>

          {/* Order Items */}
          <section className="order-section">
            <h3 className="section-title">Chi Tiết Sách</h3>
            <div className="items-container">
              {orderDetails.items && orderDetails.items.length > 0 ? (
                orderDetails.items.map((item, index) => (
                  <div key={index} className="order-item-card">
                    <div className="item-header">
                      <h4>{item.bookTitle || 'Sách không xác định'}</h4>
                      <span className="item-qty">x{item.quantity}</span>
                    </div>
                    <div className="item-footer">
                      <span className="item-unit-price">
                        {item.price?.toLocaleString('vi-VN')} ₫/cuốn
                      </span>
                      <span className="item-subtotal">
                        {(item.price * item.quantity)?.toLocaleString('vi-VN')} ₫
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-items">Không có sách nào</div>
              )}
            </div>
          </section>

          {/* Order Summary */}
          <section className="order-section">
            <h3 className="section-title">Tóm Tắt Thanh Toán</h3>
            <div className="summary-container">
              <div className="summary-row">
                <span className="summary-label">Tổng tiền hàng:</span>
                <span className="summary-value">{totalAmount?.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Phí vận chuyển:</span>
                <span className="summary-value">Miễn phí</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total">
                <span className="summary-label">Tổng cộng:</span>
                <span className="summary-value-total">
                  {orderDetails.totalAmount?.toLocaleString('vi-VN')} ₫
                </span>
              </div>
            </div>
          </section>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  )
}

export default OrderDetailModal
