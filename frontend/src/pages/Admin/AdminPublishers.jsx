import { useState, useEffect } from 'react'
import ImageUpload from '../../components/ImageUpload'
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal'
import { showSuccess, showError } from '../../utils/toastNotifications'
import '../../styles/Admin.css'

function AdminPublishers() {
  const [publishers, setPublishers] = useState([])
  const [filteredPublishers, setFilteredPublishers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [formData, setFormData] = useState({ name: '', contactInfo: '', imageUrl: '' })
  const [message, setMessage] = useState({ type: '', text: '' })
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const itemsPerPage = 10

  useEffect(() => {
    fetchPublishers()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [publishers, searchTerm])

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

  const applyFilters = () => {
    let result = [...publishers]

    if (searchTerm) {
      result = result.filter(pub =>
        pub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pub.contactInfo?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredPublishers(result)
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

    const normalizedName = formData.name?.trim() || ''
    if (!normalizedName) {
      const errorMsg = '❌ Tên nhà xuất bản không được để trống'
      setMessage({ type: 'error', text: errorMsg })
      showError(errorMsg)
      return
    }

    const isDuplicate = publishers.some(pub => pub.name?.toLowerCase() === normalizedName.toLowerCase() && pub.publisherId !== editingId)
    if (isDuplicate) {
      const errorMsg = '❌ Nhà xuất bản đã tồn tại'
      setMessage({ type: 'error', text: errorMsg })
      showError(errorMsg)
      return
    }

    const payload = { ...formData, name: normalizedName }

    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId 
        ? `http://localhost:8080/api/publishers/${editingId}`
        : 'http://localhost:8080/api/publishers'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        setFormData({ name: '', contactInfo: '', imageUrl: '' })
        setEditingId(null)
        setShowForm(false)
        fetchPublishers()
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

  const handleEdit = (publisher) => {
    setFormData({ name: publisher.name, contactInfo: publisher.contactInfo, imageUrl: publisher.imageUrl || '' })
    setEditingId(publisher.publisherId)
    setShowForm(true)
  }

  const handleDelete = (id) => {
    const publisher = publishers.find(p => p.publisherId === id)
    setDeleteTarget({ id, title: publisher?.name || 'Nhà xuất bản' })
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      setLoading(true)
      await fetch(`http://localhost:8080/api/publishers/${deleteTarget.id}`, { method: 'DELETE' })
      fetchPublishers()
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
        <h1>Quản Lý Nhà Xuất Bản</h1>
        <button 
          className="btn-add"
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            setFormData({ name: '', contactInfo: '' })
          }}
        >
          {showForm ? 'Hủy' : 'Thêm NXB'}
        </button>
      </div>

      <div className="filter-section">
        <div className="filter-row">
          <div className="filter-group search-group">
            <label>Tìm Kiếm</label>
            <input 
              type="text" 
              placeholder="Tìm theo tên hoặc thông tin liên hệ..." 
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <button className="btn-secondary" onClick={handleClearSearch}>Xóa</button>
          </div>
        </div>
      </div>

      <div className="results-info">
        <p>Hiển thị {filteredPublishers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).length} / {filteredPublishers.length} kết quả</p>
      </div>

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
          <div className="form-group">
            <label>🖼️ Ảnh NXB</label>
            <ImageUpload
              onImageUpload={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
              type="general"
              folder="publisher-images"
            />
            {formData.imageUrl && (
              <div className="image-preview">
                <img src={formData.imageUrl} alt="Publisher" />
              </div>
            )}
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
              <th>Ảnh</th>
              <th>Tên</th>
              <th>Thông Tin Liên Hệ</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {filteredPublishers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(pub => (
              <tr key={pub.publisherId}>
                <td><strong>#{pub.publisherId}</strong></td>
                <td>{pub.imageUrl ? <img src={pub.imageUrl} alt={pub.name} className="table-thumb" /> : '–'}</td>
                <td>{pub.name}</td>
                <td>{pub.contactInfo?.substring(0, 50)}{pub.contactInfo?.length > 50 ? '...' : ''}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-edit"
                      title="Sửa"
                      onClick={() => handleEdit(pub)}
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-delete"
                      title="Xóa"
                      onClick={() => handleDelete(pub.publisherId)}
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

      {filteredPublishers.length > 0 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            ← Trước
          </button>
          <span>Trang {currentPage} / {Math.ceil(filteredPublishers.length / itemsPerPage)}</span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredPublishers.length / itemsPerPage), p + 1))}
            disabled={currentPage === Math.ceil(filteredPublishers.length / itemsPerPage)}
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

export default AdminPublishers
