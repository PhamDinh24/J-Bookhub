import { useState, useEffect } from 'react'
import '../../styles/Admin.css'

function AdminPayments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8080/api/payments')
      const data = await response.json()
      setPayments(data)
    } catch (err) {
      console.error('Error fetching payments:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">⏳ Đang tải...</div>

  return (
    <div className="admin-page">
      <h1>💳 Quản Lý Thanh Toán</h1>

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
            {payments.map(payment => (
              <tr key={payment.paymentId}>
                <td><strong>#{payment.paymentId}</strong></td>
                <td><strong>#{payment.orderId}</strong></td>
                <td>{payment.paymentMethod}</td>
                <td><strong>{payment.amount?.toLocaleString('vi-VN')} ₫</strong></td>
                <td>
                  <span className={`status-badge status-${payment.status}`}>
                    {payment.status === 'completed' ? '✅ Hoàn thành' :
                     payment.status === 'pending' ? '⏳ Chờ xử lý' :
                     payment.status === 'failed' ? '❌ Thất bại' : payment.status}
                  </span>
                </td>
                <td>{payment.transactionId || '—'}</td>
                <td>{new Date(payment.paymentDate).toLocaleDateString('vi-VN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminPayments
