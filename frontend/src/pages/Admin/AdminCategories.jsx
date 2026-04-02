import { useState, useEffect } from 'react'
import ImageUpload from '../../components/ImageUpload'
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal'
import { showSuccess, showError } from '../../utils/toastNotifications'
import '../../styles/Admin.css'

function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [filteredCategories, setFilteredCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '', imageUrl: '' })
  const [message, setMessage] = useState({ type: '', text: '' })
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const itemsPerPage = 10

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [categories, searchTerm])

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

  const applyFilters = () => {
    let result = [...categories]

    if (searchTerm) {
      result = result.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredCategories(result)
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
      const errorMsg = '❌ Tên danh mục không được để trống'
      setMessage({ type: 'error', text: errorMsg })
      showError(errorMsg)
      return
    }

    const isDuplicate = categories.some(cat => cat.name?.toLowerCase() === normalizedName.toLowerCase() && cat.categoryId !== editingId)
    if (isDuplicate) {
      const errorMsg = '❌ Danh mục đã tồn tại'
      setMessage({ type: 'error', text: errorMsg })
      showError(errorMsg)
      return
    }

    setFormData(prev => ({ ...prev, name: normalizedName }))

    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId 
        ? `http://localhost:8080/api/categories/${editingId}`
        : 'http://localhost:8080/api/categories'

      const payload = { ...formData, name: normalizedName }
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        setFormData({ name: '', description: '', imageUrl: '' })
        setEditingId(null)
        setShowForm(false)
        fetchCategories()
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

  const handleEdit = (category) => {
    setFormData({ name: category.name, description: category.description, imageUrl: category.imageUrl || '' })
    setEditingId(category.categoryId)
    setShowForm(true)
  }

  const handleDelete = (id) => {
    const category = categories.find(c => c.categoryId === id)
    setDeleteTarget({ id, title: category?.name || 'Danh mục' })
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      setLoading(true)
      await fetch(`http://localhost:8080/api/categories/${deleteTarget.id}`, { method: 'DELETE' })
      fetchCategories()
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
        <h1>Quản Lý Danh Mục</h1>
        <button 
          className="btn-add"
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            setFormData({ name: '', description: '' })
          }}
        >
          {showForm ? 'Hủy' : 'Thêm Danh Mục'}
        </button>
      </div>

      <div className="filter-section">
        <div className="filter-row">
          <div className="filter-group search-group">
            <label>Tìm Kiếm</label>
            <input 
              type="text" 
              placeholder="Tìm theo tên hoặc mô tả..." 
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <button className="btn-secondary" onClick={handleClearSearch}>Xóa</button>
          </div>
        </div>
      </div>

      <div className="results-info">
        <p>Hiển thị {filteredCategories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).length} / {filteredCategories.length} kết quả</p>
      </div>

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
          <div className="form-group">
            <label>🖼️ Ảnh Danh Mục</label>
            <ImageUpload
              onImageUpload={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
              type="general"
              folder="category-images"
            />
            {formData.imageUrl && (
              <div className="image-preview">
                <img src={formData.imageUrl} alt="Category" />
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
              <th>Mô Tả</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(cat => (
              <tr key={cat.categoryId}>
                <td><strong>#{cat.categoryId}</strong></td>
                <td>{cat.imageUrl ? <img src={cat.imageUrl} alt={cat.name} className="table-thumb" /> : '–'}</td>
                <td>{cat.name}</td>
                <td>{cat.description?.substring(0, 50)}{cat.description?.length > 50 ? '...' : ''}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-edit"
                      title="Sửa"
                      onClick={() => handleEdit(cat)}
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-delete"
                      title="Xóa"
                      onClick={() => handleDelete(cat.categoryId)}
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

      {filteredCategories.length > 0 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            ← Trước
          </button>
          <span>Trang {currentPage} / {Math.ceil(filteredCategories.length / itemsPerPage)}</span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredCategories.length / itemsPerPage), p + 1))}
            disabled={currentPage === Math.ceil(filteredCategories.length / itemsPerPage)}
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

export default AdminCategories
