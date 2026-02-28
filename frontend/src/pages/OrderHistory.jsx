import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import orderService from '../services/orderService'
import { showError } from '../utils/toastNotifications'
import '../styles/OrderHistory.css'

function OrderHistory() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user || !user.userId) {
      navigate('/login')
      return
    }
    fetchOrders()
  }, [user, navigate])

  const fetchOrders = async () => {
    try {
      const userId = user.userId
      const response = await orderService.getOrdersByUserId(userId)
      setOrders(response.data || [])
    } catch (err) {
      console.error('Lỗi khi tải lịch sử đơn hàng:', err)
      showError('❌ Lỗi khi tải lịch sử đơn hàng')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">Đang tải...</div>

  return (
    <div className="order-history-container">
      <h1>Lịch Sử Đơn Hàng</h1>
      
      {orders.length === 0 ? (
        <div className="empty-state">
          <p>Bạn chưa có đơn hàng nào</p>
          <a href="/books" className="btn btn-primary">Mua Sách Ngay</a>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.orderId} className="order-card">
              <div className="order-header">
                <h3>Đơn hàng #{order.orderId}</h3>
                <span className={`status status-${order.status}`}>{order.status}</span>
              </div>
              <div className="order-details">
                <p>Ngày đặt: {new Date(order.orderDate).toLocaleDateString('vi-VN')}</p>
                <p>Tổng tiền: {order.totalAmount?.toLocaleString()} VND</p>
                <p>Địa chỉ: {order.shippingAddress}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default OrderHistory
