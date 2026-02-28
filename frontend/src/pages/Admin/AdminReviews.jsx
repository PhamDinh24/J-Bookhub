import { useState, useEffect } from 'react'
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal'
import api from '../../services/api'
import { showSuccess, showError } from '../../utils/toastNotifications'
import '../../styles/Admin.css'

function AdminReviews() {
  const [reviews, setReviews] = useState([])
  const [filteredReviews, setFilteredReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingReview, setEditingReview] = useState(null)
  const [editFormData, setEditFormData] = useState({
    rating: 5,
    comment: ''
  })
  const [editLoading, setEditLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [ratingFilter, setRatingFilter] = useState('')
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })
  const itemsPerPage = 10

  useEffect(() => {
    fetchReviews()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [reviews, searchTerm, ratingFilter, dateRange])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await api.get('/reviews')
      setReviews(response.data || [])
    } catch (err) {
      console.error('Error fetching reviews:', err)
      setMessage({ type: 'error', text: 'Lỗi tải đánh giá' })
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let result = [...reviews]

    if (searchTerm) {
      result = result.filter(review =>
        review.book?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.user?.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (ratingFilter) {
      result = result.filter(review => review.rating === parseInt(ratingFilter))
    }

    if (dateRange.startDate) {
      const startDate = new Date(dateRange.startDate)
      result = result.filter(review => new Date(review.reviewDate) >= startDate)
    }

    if (dateRange.endDate) {
      const endDate = new Date(dateRange.endDate)
      endDate.setHours(23, 59, 59, 999)
      result = result.filter(review => new Date(review.reviewDate) <= endDate)
    }

    setFilteredReviews(result)
    setCurrentPage(1)
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleRatingFilterChange = (e) => {
    setRatingFilter(e.target.value)
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
    setRatingFilter('')
    setDateRange({ startDate: '', endDate: '' })
  }

  const handleEditClick = (review) => {
    setEditingReview(review)
    setEditFormData({
      rating: review.rating,
      comment: review.comment
    })
    setShowEditModal(true)
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value
    }))
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    
    if (!editFormData.comment.trim()) {
      const msg = 'Bình luận không được để trống'
      setMessage({ type: 'error', text: msg })
      showError('❌ ' + msg)
      return
    }

    setEditLoading(true)
    try {
      await api.put(`/reviews/${editingReview.reviewId}`, {
        rating: editFormData.rating,
        comment: editFormData.comment
      })
      const successMsg = '✅ Cập nhật đánh giá thành công'
      setMessage({ type: 'success', text: successMsg })
      showSuccess(successMsg)
      setShowEditModal(false)
      fetchReviews()
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (err) {
      console.error('Error updating review:', err)
      const errorMsg = err.response?.data?.error || '❌ Lỗi cập nhật đánh giá'
      setMessage({ type: 'error', text: errorMsg })
      showError(errorMsg)
    } finally {
      setEditLoading(false)
    }
  }

  const handleDelete = (id) => {
    const review = reviews.find(r => r.reviewId === id)
    setDeleteTarget({ id, title: `Đánh giá cho "${review?.book?.title || 'Sách'}"` })
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      setLoading(true)
      await api.delete(`/reviews/${deleteTarget.id}`)
      const successMsg = '✅ Xóa thành công'
      fetchReviews()
      setMessage({ type: 'success', text: successMsg })
      showSuccess(successMsg)
      setShowDeleteConfirm(false)
      setDeleteTarget(null)
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (err) {
      console.error('Error deleting review:', err)
      const errorMsg = '❌ Lỗi: ' + err.message
      setMessage({ type: 'error', text: errorMsg })
      showError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">Đang tải...</div>

  return (
    <div className="admin-page">
      <h1>Quản Lý Đánh Giá</h1>

      {message.text && (
        <div className={`${message.type}-message`} style={{ marginBottom: '1.5rem' }}>
          {message.text}
        </div>
      )}

      <div className="filter-section">
        <div className="filter-row">
          <div className="filter-group" style={{ flex: 1 }}>
            <label>Tìm Kiếm</label>
            <input 
              type="text" 
              placeholder="Tìm theo tên sách hoặc email người dùng..." 
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="filter-group">
            <label>Đánh Giá</label>
            <select value={ratingFilter} onChange={handleRatingFilterChange}>
              <option value="">-- Tất cả --</option>
              <option value="5">5 sao</option>
              <option value="4">4 sao</option>
              <option value="3">3 sao</option>
              <option value="2">2 sao</option>
              <option value="1">1 sao</option>
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
        <p>Hiển thị {filteredReviews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).length} / {filteredReviews.length} kết quả</p>
      </div>

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
            {filteredReviews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(review => (
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
                  <div className="action-buttons">
                    <button
                      className="btn-edit"
                      title="Sửa"
                      onClick={() => handleEditClick(review)}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-delete"
                      title="Xóa"
                      onClick={() => handleDelete(review.reviewId)}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {reviews.length > 0 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            ← Trước
          </button>
          <span>Trang {currentPage} / {Math.ceil(filteredReviews.length / itemsPerPage)}</span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredReviews.length / itemsPerPage), p + 1))}
            disabled={currentPage === Math.ceil(filteredReviews.length / itemsPerPage)}
          >
            Sau →
          </button>
        </div>
      )}

      {showEditModal && editingReview && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Sửa Đánh Giá</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form className="modal-form" onSubmit={handleSaveEdit}>
              {message.text && (
                <div className={`${message.type}-message`}>{message.text}</div>
              )}

              <div className="form-group">
                <label>Sách: {editingReview.book?.title}</label>
              </div>

              <div className="form-group">
                <label>Đánh Giá (Sao) *</label>
                <select 
                  name="rating"
                  value={editFormData.rating}
                  onChange={handleEditChange}
                  required
                >
                  <option value="1">⭐ 1 Sao</option>
                  <option value="2">⭐⭐ 2 Sao</option>
                  <option value="3">⭐⭐⭐ 3 Sao</option>
                  <option value="4">⭐⭐⭐⭐ 4 Sao</option>
                  <option value="5">⭐⭐⭐⭐⭐ 5 Sao</option>
                </select>
              </div>

              <div className="form-group">
                <label>Bình Luận *</label>
                <textarea 
                  name="comment"
                  value={editFormData.comment}
                  onChange={handleEditChange}
                  rows="4"
                  placeholder="Nhập bình luận"
                  required
                />
              </div>

              <div className="modal-buttons">
                <button type="button" className="btn-cancel" onClick={() => setShowEditModal(false)}>Hủy</button>
                <button type="submit" className="btn-save" disabled={editLoading}>
                  {editLoading ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        title={deleteTarget?.title}
        message="Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa?"
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false)
          setDeleteTarget(null)
        }}
        isLoading={loading}
      />
    </div>
  )
}

export default AdminReviews
