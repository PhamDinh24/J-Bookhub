import { useState, useEffect } from 'react'
import '../../styles/Admin.css'

function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8080/api/categories')
      const data = await response.json()
      setCategories(data)
    } catch (err) {
      console.error('Error fetching categories:', err)
      setMessage({ type: 'error', text: 'Lỗi tải danh mục' })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId 
        ? `http://localhost:8080/api/categories/${editingId}`
        : 'http://localhost:8080/api/categories'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setFormData({ name: '', description: '' })
        setEditingId(null)
        setShowForm(false)
        fetchCategories()
        setMessage({ type: 'success', text: editingId ? '✅ Cập nhật thành công' : '✅ Thêm thành công' })
        setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      }
    } catch (err) {
      console.error('Error:', err)
      setMessage({ type: 'error', text: '❌ Lỗi: ' + err.message })
    }
  }

  const handleEdit = (category) => {
    setFormData({ name: category.name, description: category.description })
    setEditingId(category.categoryId)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa danh mục này?')) return
    try {
      await fetch(`http://localhost:8080/api/categories/${id}`, { method: 'DELETE' })
      fetchCategories()
      setMessage({ type: 'success', text: '✅ Xóa thành công' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (err) {
      setMessage({ type: 'error', text: '❌ Lỗi: ' + err.message })
    }
  }

  if (loading) return <div className="loading">⏳ Đang tải...</div>

  return (
    <div className="admin-page">
      <h1>🏷️ Quản Lý Danh Mục</h1>

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
          setFormData({ name: '', description: '' })
        }}
      >
        {showForm ? '❌ Hủy' : '➕ Thêm Danh Mục'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label>📝 Tên Danh Mục</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nhập tên danh mục..."
              required
            />
          </div>
          <div className="form-group">
            <label>📄 Mô Tả</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Nhập mô tả danh mục..."
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
              <th>Mô Tả</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat.categoryId}>
                <td><strong>#{cat.categoryId}</strong></td>
                <td>{cat.name}</td>
                <td>{cat.description?.substring(0, 50)}{cat.description?.length > 50 ? '...' : ''}</td>
                <td>
                  <button 
                    className="btn-edit"
                    onClick={() => handleEdit(cat)}
                  >
                    ✏️ Sửa
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => handleDelete(cat.categoryId)}
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

export default AdminCategories
