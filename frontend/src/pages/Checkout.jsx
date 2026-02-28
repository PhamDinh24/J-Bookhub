import { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CartContext } from '../context/CartContext'
import { AuthContext } from '../context/AuthContext'
import orderService from '../services/orderService'
import paymentService from '../services/paymentService'
import { showSuccess, showError, showLoading, dismissToast } from '../utils/toastNotifications'
import '../styles/Checkout.css'

function Checkout() {
  const { cartItems, clearCart } = useContext(CartContext)
  const { isAuthenticated, user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    paymentMethod: 'COD'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || ''
      }))
    }
  }, [isAuthenticated, user, navigate])

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (cartItems.length === 0) {
      const msg = 'Giỏ hàng trống. Vui lòng thêm sách trước khi thanh toán.'
      setError(msg)
      showError('❌ ' + msg)
      setLoading(false)
      return
    }

    const toastId = showLoading('⏳ Đang xử lý đơn hàng...')

    try {
      // Create order
      const orderData = {
        userId: user.userId,
        totalAmount: totalAmount,
        shippingAddress: formData.address,
        status: 'pending'
      }

      console.log('Creating order with data:', JSON.stringify(orderData))
      console.log('Token in localStorage:', localStorage.getItem('token'))
      const orderResponse = await orderService.createOrder(orderData)
      console.log('Order created successfully:', orderResponse.data)
      const orderId = orderResponse.data.orderId

      if (formData.paymentMethod === 'VNPay') {
        // Create VNPay payment URL
        const returnUrl = `${window.location.origin}/payment-success?orderId=${orderId}&amount=${totalAmount}`
        const paymentResponse = await paymentService.createVNPayUrl(
          orderId,
          totalAmount * 100,
          `Thanh toan don hang ${orderId}`,
          returnUrl
        )
        
        dismissToast(toastId)
        showSuccess('✅ Đơn hàng đã được tạo thành công!')
        // Redirect to VNPay
        window.location.href = paymentResponse.data.paymentUrl
      } else {
        // COD payment
        dismissToast(toastId)
        showSuccess('✅ Đơn hàng đã được tạo thành công!')
        clearCart()
        navigate(`/payment-success?orderId=${orderId}&amount=${totalAmount}`)
      }
    } catch (err) {
      dismissToast(toastId)
      const errorMsg = err.response?.data?.error || 'Lỗi khi tạo đơn hàng. Vui lòng thử lại.'
      setError(errorMsg)
      showError('❌ ' + errorMsg)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="checkout-container">
      <div className="checkout-content">
        <div className="checkout-form">
          <h1>Thanh Toán</h1>
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <section className="form-section">
              <h2>Thông Tin Giao Hàng</h2>
              
              <div className="form-group">
                <label>Họ và Tên</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Số Điện Thoại</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Địa Chỉ Giao Hàng</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  required
                />
              </div>
            </section>

            <section className="form-section">
              <h2>Phương Thức Thanh Toán</h2>
              
              <div className="payment-options">
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={formData.paymentMethod === 'COD'}
                    onChange={handleChange}
                  />
                  <span className="option-label">
                    <strong>Thanh Toán Khi Nhận Hàng (COD)</strong>
                    <small>Thanh toán tiền mặt khi nhận hàng</small>
                  </span>
                </label>

                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="VNPay"
                    checked={formData.paymentMethod === 'VNPay'}
                    onChange={handleChange}
                  />
                  <span className="option-label">
                    <strong>Thanh Toán Qua VNPay</strong>
                    <small>Thanh toán trực tuyến an toàn</small>
                  </span>
                </label>
              </div>
            </section>

            <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
              {loading ? 'Đang xử lý...' : `Thanh Toán (${totalAmount.toLocaleString('vi-VN')} ₫)`}
            </button>
          </form>
        </div>

        <aside className="checkout-summary">
          <h2>Tóm Tắt Đơn Hàng</h2>
          
          <div className="order-items">
            {cartItems.length === 0 ? (
              <p className="empty-cart">Giỏ hàng trống</p>
            ) : (
              cartItems.map(item => (
                <div key={item.bookId} className="order-item">
                  <div className="item-info">
                    <h4>{item.title}</h4>
                    <p>Số lượng: {item.quantity}</p>
                  </div>
                  <div className="item-price">
                    {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="order-summary">
            <div className="summary-row">
              <span>Tổng tiền hàng:</span>
              <span>{totalAmount.toLocaleString('vi-VN')} ₫</span>
            </div>
            <div className="summary-row">
              <span>Phí vận chuyển:</span>
              <span>Miễn phí</span>
            </div>
            <div className="summary-row total">
              <span>Tổng cộng:</span>
              <span>{totalAmount.toLocaleString('vi-VN')} ₫</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default Checkout
