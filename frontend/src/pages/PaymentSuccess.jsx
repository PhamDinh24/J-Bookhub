import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import '../styles/PaymentStatus.css'

function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const [orderInfo, setOrderInfo] = useState({
    orderId: '',
    amount: '',
    transactionId: ''
  })

  useEffect(() => {
    setOrderInfo({
      orderId: searchParams.get('orderId') || 'N/A',
      amount: searchParams.get('amount') || '0',
      transactionId: searchParams.get('transactionId') || 'N/A'
    })
  }, [searchParams])

  return (
    <div className="payment-status-container">
      <div className="status-card success">
        <div className="status-icon">✓</div>
        <h1>Thanh Toán Thành Công!</h1>
        <p className="status-message">
          Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xác nhận.
        </p>

        <div className="order-details">
          <div className="detail-row">
            <span className="label">Mã Đơn Hàng:</span>
            <span className="value">{orderInfo.orderId}</span>
          </div>
          <div className="detail-row">
            <span className="label">Số Tiền:</span>
            <span className="value">{parseInt(orderInfo.amount).toLocaleString('vi-VN')} ₫</span>
          </div>
          <div className="detail-row">
            <span className="label">Mã Giao Dịch:</span>
            <span className="value">{orderInfo.transactionId}</span>
          </div>
        </div>

        <div className="next-steps">
          <h3>Bước Tiếp Theo:</h3>
          <ul>
            <li>Kiểm tra email để nhận xác nhận đơn hàng</li>
            <li>Theo dõi trạng thái đơn hàng tại trang "Đơn Hàng Của Tôi"</li>
            <li>Hàng sẽ được giao trong 2-3 ngày làm việc</li>
          </ul>
        </div>

        <div className="action-buttons">
          <Link to="/orders" className="btn btn-primary">
            Xem Đơn Hàng
          </Link>
          <Link to="/books" className="btn btn-secondary">
            Tiếp Tục Mua Sắm
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccess
