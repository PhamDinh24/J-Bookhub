import { useState, useEffect } from 'react'
import '../../styles/Admin.css'

function AdminReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8080/api/reviews')
      const data = await response.json()
      setReviews(data)
    } catch (err) {
      console.error('Error fetching reviews:', err)
      setMessage({ type: 'error', text: 'Lỗi tải đánh giá' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa đánh giá này?')) return
    try {
      const response = await fetch(`http://localhost:8080/api/reviews/${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        fetchReviews()
        setMessage({ type: 'success', text: '✅ Xóa thành công' })
        setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      }
    } catch (err) {
      console.error('Error deleting review:', err)
      setMessage({ type: 'error', text: '❌ Lỗi: ' + err.message })
    }
  }

  if (loading) return <div className="loading">⏳ Đang tải...</div>

  return (
    <div className="admin-page">
      <h1>⭐ Quản Lý Đánh Giá</h1>

      {message.text && (
        <div className={`${message.type}-message`} style={{ marginBottom: '1.5rem' }}>
          {message.text}
        </div>
      )}

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Sách</th>
              <th>Người Dùng</th>
              <th>Đánh Giá</th>
              <th>Bình Luận</th>
              <th>Ngày</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map(review => (
              <tr key={review.reviewId}>
                <td><strong>#{review.reviewId}</strong></td>
                <td>{review.book?.title || '—'}</td>
                <td>{review.user?.email || '—'}</td>
                <td>
                  <span className="rating">
                    {'⭐'.repeat(review.rating)}
                  </span>
                </td>
                <td>{review.comment?.substring(0, 40)}{review.comment?.length > 40 ? '...' : ''}</td>
                <td>{new Date(review.reviewDate).toLocaleDateString('vi-VN')}</td>
                <td>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(review.reviewId)}
                  >
                    🗑️ Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminReviews
