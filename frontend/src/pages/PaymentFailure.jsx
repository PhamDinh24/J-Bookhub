import { useSearchParams, Link } from 'react-router-dom'
import '../styles/PaymentStatus.css'

function PaymentFailure() {
  const [searchParams] = useSearchParams()
  const errorCode = searchParams.get('errorCode') || 'UNKNOWN'

  const getErrorMessage = (code) => {
    const errors = {
      '01': 'Người dùng hủy giao dịch',
      '02': 'Số tiền không hợp lệ',
      '03': 'Tài khoản không đủ tiền',
      '04': 'Thẻ đã hết hạn',
      '05': 'Thẻ bị khóa',
      'UNKNOWN': 'Lỗi thanh toán không xác định'
    }
    return errors[code] || errors['UNKNOWN']
  }

  return (
    <div className="payment-status-container">
      <div className="status-card failure">
        <div className="status-icon">✕</div>
        <h1>Thanh Toán Thất Bại</h1>
        <p className="status-message">
          {getErrorMessage(errorCode)}
        </p>

        <div className="error-details">
          <p>Mã lỗi: <strong>{errorCode}</strong></p>
          <p>Vui lòng thử lại hoặc liên hệ với chúng tôi để được hỗ trợ.</p>
        </div>

        <div className="action-buttons">
          <Link to="/checkout" className="btn btn-primary">
            Thử Lại
          </Link>
          <Link to="/cart" className="btn btn-secondary">
            Quay Lại Giỏ Hàng
          </Link>
        </div>

        <div className="support-info">
          <h3>Cần Hỗ Trợ?</h3>
          <p>Email: support@bookstore.com</p>
          <p>Hotline: 0123456789</p>
        </div>
      </div>
    </div>
  )
}

export default PaymentFailure
