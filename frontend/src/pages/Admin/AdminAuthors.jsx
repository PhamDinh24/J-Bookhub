import { useState, useEffect } from 'react'
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal'
import { showSuccess, showError } from '../../utils/toastNotifications'
import '../../styles/Admin.css'

function AdminAuthors() {
  const [authors, setAuthors] = useState([])
  const [filteredAuthors, setFilteredAuthors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [formData, setFormData] = useState({ name: '', bio: '' })
  const [message, setMessage] = useState({ type: '', text: '' })
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const itemsPerPage = 10

  useEffect(() => {
    fetchAuthors()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [authors, searchTerm])

  const fetchAuthors = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8080/api/authors')
      const data = await response.json()
      setAuthors(data)
    } catch (err) {
      console.error('Error fetching authors:', err)
      setMessage({ type: 'error', text: 'Lỗi tải tác giả' })
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let result = [...authors]

    if (searchTerm) {
      result = result.filter(author =>
        author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        author.bio?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredAuthors(result)
    setCurrentPage(1)
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleClearSearch = () => {
    setSearchTerm('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId 
        ? `http://localhost:8080/api/authors/${editingId}`
        : 'http://localhost:8080/api/authors'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setFormData({ name: '', bio: '' })
        setEditingId(null)
        setShowForm(false)
        fetchAuthors()
        const successMsg = editingId ? '✅ Cập nhật thành công' : '✅ Thêm thành công'
        setMessage({ type: 'success', text: successMsg })
        showSuccess(successMsg)
        setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      }
    } catch (err) {
      console.error('Error:', err)
      const errorMsg = '❌ Lỗi: ' + err.message
      setMessage({ type: 'error', text: errorMsg })
      showError(errorMsg)
    }
  }

  const handleEdit = (author) => {
    setFormData({ name: author.name, bio: author.bio })
    setEditingId(author.authorId)
    setShowForm(true)
  }

  const handleDelete = (id) => {
    const author = authors.find(a => a.authorId === id)
    setDeleteTarget({ id, title: author?.name || 'Tác giả' })
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      setLoading(true)
      await fetch(`http://localhost:8080/api/authors/${deleteTarget.id}`, { method: 'DELETE' })
      fetchAuthors()
      const successMsg = '✅ Xóa thành công'
      setMessage({ type: 'success', text: successMsg })
      showSuccess(successMsg)
      setShowDeleteConfirm(false)
      setDeleteTarget(null)
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (err) {
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
      {message.text && (
        <div className={`${message.type}-message`} style={{ marginBottom: '1.5rem' }}>
          {message.text}
        </div>
      )}

      <div className="admin-header">
        <h1>Quản Lý Tác Giả</h1>
        <button 
          className="btn-add"
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            setFormData({ name: '', bio: '' })
          }}
        >
          {showForm ? 'Hủy' : 'Thêm Tác Giả'}
        </button>
      </div>

      <div className="filter-section">
        <div className="filter-row">
          <div className="filter-group" style={{ flex: 1 }}>
            <label>Tìm Kiếm</label>
            <input 
              type="text" 
              placeholder="Tìm theo tên hoặc tiểu sử..." 
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="filter-actions" style={{ alignItems: 'flex-end' }}>
            <button className="btn-secondary" onClick={handleClearSearch}>Xóa Tìm Kiếm</button>
          </div>
        </div>
      </div>

      <div className="results-info">
        <p>Hiển thị {filteredAuthors.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).length} / {filteredAuthors.length} kết quả</p>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label>📝 Tên Tác Giả</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nhập tên tác giả..."
              required
            />
          </div>
          <div className="form-group">
            <label>📄 Tiểu Sử</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Nhập tiểu sử tác giả..."
              rows="3"
            />
          </div>
          <button type="submit" className="btn btn-success">
            {editingId ? 'Cập Nhật' : 'Thêm'}
          </button>
        </form>
      )}

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>Tiểu Sử</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {filteredAuthors.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(author => (
              <tr key={author.authorId}>
                <td><strong>#{author.authorId}</strong></td>
                <td>{author.name}</td>
                <td>{author.bio?.substring(0, 50)}{author.bio?.length > 50 ? '...' : ''}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-edit"
                      title="Sửa"
                      onClick={() => handleEdit(author)}
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-delete"
                      title="Xóa"
                      onClick={() => handleDelete(author.authorId)}
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

      {filteredAuthors.length > 0 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            ← Trước
          </button>
          <span>Trang {currentPage} / {Math.ceil(filteredAuthors.length / itemsPerPage)}</span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredAuthors.length / itemsPerPage), p + 1))}
            disabled={currentPage === Math.ceil(filteredAuthors.length / itemsPerPage)}
          >
            Sau →
          </button>
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

export default AdminAuthors
