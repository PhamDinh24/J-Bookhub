import { useState, useEffect } from 'react'
import '../../styles/Admin.css'

function AdminAuthors() {
  const [authors, setAuthors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ name: '', bio: '' })
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchAuthors()
  }, [])

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
        setMessage({ type: 'success', text: editingId ? '✅ Cập nhật thành công' : '✅ Thêm thành công' })
        setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      }
    } catch (err) {
      console.error('Error:', err)
      setMessage({ type: 'error', text: '❌ Lỗi: ' + err.message })
    }
  }

  const handleEdit = (author) => {
    setFormData({ name: author.name, bio: author.bio })
    setEditingId(author.authorId)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa tác giả này?')) return
    try {
      await fetch(`http://localhost:8080/api/authors/${id}`, { method: 'DELETE' })
      fetchAuthors()
      setMessage({ type: 'success', text: '✅ Xóa thành công' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (err) {
      setMessage({ type: 'error', text: '❌ Lỗi: ' + err.message })
    }
  }

  if (loading) return <div className="loading">⏳ Đang tải...</div>

  return (
    <div className="admin-page">
      <h1>✍️ Quản Lý Tác Giả</h1>

      {message.text && (
        <div className={`${message.type}-message`} style={{ marginBottom: '1.5rem' }}>
          {message.text}
        </div>
      )}

      <button 
        className="btn btn-primary"
        onClick={() => {
          setShowForm(!showForm)
          setEditingId(null)
          setFormData({ name: '', bio: '' })
        }}
      >
        {showForm ? '❌ Hủy' : '➕ Thêm Tác Giả'}
      </button>

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
            {editingId ? '💾 Cập Nhật' : '➕ Thêm'}
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
            {authors.map(author => (
              <tr key={author.authorId}>
                <td><strong>#{author.authorId}</strong></td>
                <td>{author.name}</td>
                <td>{author.bio?.substring(0, 50)}{author.bio?.length > 50 ? '...' : ''}</td>
                <td>
                  <button 
                    className="btn-edit"
                    onClick={() => handleEdit(author)}
                  >
                    ✏️ Sửa
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => handleDelete(author.authorId)}
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

export default AdminAuthors
