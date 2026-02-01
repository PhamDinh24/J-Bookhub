import { useState, useEffect } from 'react'
import '../../styles/Admin.css'

function AdminPublishers() {
  const [publishers, setPublishers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ name: '', contactInfo: '' })
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchPublishers()
  }, [])

  const fetchPublishers = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8080/api/publishers')
      const data = await response.json()
      setPublishers(data)
    } catch (err) {
      console.error('Error fetching publishers:', err)
      setMessage({ type: 'error', text: 'Lỗi tải nhà xuất bản' })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId 
        ? `http://localhost:8080/api/publishers/${editingId}`
        : 'http://localhost:8080/api/publishers'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setFormData({ name: '', contactInfo: '' })
        setEditingId(null)
        setShowForm(false)
        fetchPublishers()
        setMessage({ type: 'success', text: editingId ? '✅ Cập nhật thành công' : '✅ Thêm thành công' })
        setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      }
    } catch (err) {
      console.error('Error:', err)
      setMessage({ type: 'error', text: '❌ Lỗi: ' + err.message })
    }
  }

  const handleEdit = (publisher) => {
    setFormData({ name: publisher.name, contactInfo: publisher.contactInfo })
    setEditingId(publisher.publisherId)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa nhà xuất bản này?')) return
    try {
      await fetch(`http://localhost:8080/api/publishers/${id}`, { method: 'DELETE' })
      fetchPublishers()
      setMessage({ type: 'success', text: '✅ Xóa thành công' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (err) {
      setMessage({ type: 'error', text: '❌ Lỗi: ' + err.message })
    }
  }

  if (loading) return <div className="loading">⏳ Đang tải...</div>

  return (
    <div className="admin-page">
      <h1>🏢 Quản Lý Nhà Xuất Bản</h1>

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
          setFormData({ name: '', contactInfo: '' })
        }}
      >
        {showForm ? '❌ Hủy' : '➕ Thêm NXB'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label>📝 Tên NXB</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nhập tên nhà xuất bản..."
              required
            />
          </div>
          <div className="form-group">
            <label>📞 Thông Tin Liên Hệ</label>
            <textarea
              value={formData.contactInfo}
              onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
              placeholder="Nhập thông tin liên hệ..."
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
              <th>Thông Tin Liên Hệ</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {publishers.map(pub => (
              <tr key={pub.publisherId}>
                <td><strong>#{pub.publisherId}</strong></td>
                <td>{pub.name}</td>
                <td>{pub.contactInfo?.substring(0, 50)}{pub.contactInfo?.length > 50 ? '...' : ''}</td>
                <td>
                  <button 
                    className="btn-edit"
                    onClick={() => handleEdit(pub)}
                  >
                    ✏️ Sửa
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => handleDelete(pub.publisherId)}
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

export default AdminPublishers
