import { useState, useEffect } from 'react'
import ImageUpload from '../../components/ImageUpload'
import api from '../../services/api'

function AdminBooks() {
  const [books, setBooks] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    stockQuantity: '',
    categoryId: '',
    authorId: '',
    publisherId: '',
    coverImageUrl: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    try {
      const response = await api.get('/books')
      setBooks(response.data)
    } catch (err) {
      console.error('Error fetching books:', err)
      setError('Lỗi tải danh sách sách')
    }
  }

  const handleAddBook = () => {
    setEditingId(null)
    setFormData({
      title: '',
      description: '',
      price: '',
      stockQuantity: '',
      categoryId: '',
      authorId: '',
      publisherId: '',
      coverImageUrl: ''
    })
    setMessage('')
    setError('')
    setShowModal(true)
  }

  const handleEditBook = (book) => {
    setEditingId(book.bookId)
    setFormData({
      title: book.title,
      description: book.description || '',
      price: book.price,
      stockQuantity: book.stockQuantity,
      categoryId: book.categoryId || '',
      authorId: book.authorId || '',
      publisherId: book.publisherId || '',
      coverImageUrl: book.coverImageUrl || ''
    })
    setMessage('')
    setError('')
    setShowModal(true)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageUpload = (imageUrl) => {
    setFormData(prev => ({
      ...prev,
      coverImageUrl: imageUrl
    }))
    setMessage('Hình ảnh tải lên thành công!')
    setTimeout(() => setMessage(''), 2000)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    
    if (!formData.title || !formData.price || !formData.stockQuantity) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const bookData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity),
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        authorId: formData.authorId ? parseInt(formData.authorId) : null,
        publisherId: formData.publisherId ? parseInt(formData.publisherId) : null,
        coverImageUrl: formData.coverImageUrl
      }

      if (editingId) {
        await api.put(`/books/${editingId}`, bookData)
        setMessage('Cập nhật sách thành công!')
      } else {
        await api.post('/books', bookData)
        setMessage('Thêm sách thành công!')
      }
      
      setShowModal(false)
      fetchBooks()
      setTimeout(() => setMessage(''), 2000)
    } catch (err) {
      setError(editingId ? 'Lỗi cập nhật sách. Vui lòng thử lại.' : 'Lỗi thêm sách. Vui lòng thử lại.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBook = async (bookId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sách này?')) {
      try {
        await api.delete(`/books/${bookId}`)
        setMessage('Xóa sách thành công!')
        fetchBooks()
        setTimeout(() => setMessage(''), 2000)
      } catch (err) {
        setError('Lỗi xóa sách')
        console.error(err)
      }
    }
  }

  return (
    <div>
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="admin-header">
        <h1>Quản Lý Sách</h1>
        <button className="btn-add" onClick={handleAddBook}>+ Thêm Sách</button>
      </div>

      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tiêu Đề</th>
              <th>Tác Giả</th>
              <th>Giá</th>
              <th>Số Lượng</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {books.length === 0 ? (
              <tr><td colSpan="6" style={{textAlign: 'center'}}>Không có dữ liệu</td></tr>
            ) : (
              books.map(book => (
                <tr key={book.bookId}>
                  <td>{book.bookId}</td>
                  <td>{book.title}</td>
                  <td>{book.authorId || '-'}</td>
                  <td>{book.price?.toLocaleString()} VND</td>
                  <td>{book.stockQuantity}</td>
                  <td>
                    <button className="btn-edit" onClick={() => handleEditBook(book)}>Sửa</button>
                    <button className="btn-delete" onClick={() => handleDeleteBook(book.bookId)}>Xóa</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingId ? 'Sửa Sách' : 'Thêm Sách'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form className="modal-form" onSubmit={handleSave}>
              {message && <div className="success-message">{message}</div>}
              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label>Tiêu Đề *</label>
                <input 
                  type="text" 
                  name="title"
                  placeholder="Tiêu đề sách" 
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Mô Tả</label>
                <textarea 
                  name="description"
                  placeholder="Mô tả sách" 
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Giá *</label>
                  <input 
                    type="number" 
                    name="price"
                    placeholder="Giá" 
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Số Lượng *</label>
                  <input 
                    type="number" 
                    name="stockQuantity"
                    placeholder="Số lượng" 
                    value={formData.stockQuantity}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Danh Mục</label>
                  <input 
                    type="number" 
                    name="categoryId"
                    placeholder="ID Danh mục" 
                    value={formData.categoryId}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Tác Giả</label>
                  <input 
                    type="number" 
                    name="authorId"
                    placeholder="ID Tác giả" 
                    value={formData.authorId}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Nhà Xuất Bản</label>
                <input 
                  type="number" 
                  name="publisherId"
                  placeholder="ID Nhà xuất bản" 
                  value={formData.publisherId}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Hình Ảnh Bìa</label>
                <ImageUpload 
                  onImageUpload={handleImageUpload}
                  type="book-cover"
                  folder="book-covers"
                />
                {formData.coverImageUrl && (
                  <div className="image-preview">
                    <img src={formData.coverImageUrl} alt="Book cover" />
                    <p>Hình ảnh đã tải lên</p>
                  </div>
                )}
              </div>

              <div className="modal-buttons">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn-save" disabled={loading}>
                  {loading ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminBooks
