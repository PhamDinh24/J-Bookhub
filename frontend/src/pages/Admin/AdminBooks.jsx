import { useState, useEffect } from 'react'
import ImageUpload from '../../components/ImageUpload'
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal'
import api from '../../services/api'
import { showSuccess, showError } from '../../utils/toastNotifications'

function AdminBooks() {
  const [books, setBooks] = useState([])
  const [filteredBooks, setFilteredBooks] = useState([])
  const [categories, setCategories] = useState([])
  const [authors, setAuthors] = useState([])
  const [publishers, setPublishers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    stockQuantity: '',
    categoryId: '',
    authorId: '',
    publisherId: '',
    isbn: '',
    publicationYear: '',
    coverImageUrl: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loadingDropdowns, setLoadingDropdowns] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [authorFilter, setAuthorFilter] = useState('')
  const [publisherFilter, setPublisherFilter] = useState('')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [stockFilter, setStockFilter] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    fetchBooks()
    fetchDropdownData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [books, searchTerm, categoryFilter, authorFilter, publisherFilter, priceRange, stockFilter])

  const fetchDropdownData = async () => {
    setLoadingDropdowns(true)
    try {
      const [categoriesRes, authorsRes, publishersRes] = await Promise.all([
        api.get('/categories'),
        api.get('/authors'),
        api.get('/publishers')
      ])
      setCategories(categoriesRes.data || [])
      setAuthors(authorsRes.data || [])
      setPublishers(publishersRes.data || [])
    } catch (err) {
      console.error('Error fetching dropdown data:', err)
      setError('Lỗi tải dữ liệu danh mục')
    } finally {
      setLoadingDropdowns(false)
    }
  }

  const fetchBooks = async () => {
    try {
      const response = await api.get('/books')
      setBooks(response.data)
    } catch (err) {
      console.error('Error fetching books:', err)
      setError('Lỗi tải danh sách sách')
    }
  }

  const applyFilters = () => {
    let result = [...books]

    if (searchTerm) {
      result = result.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.isbn?.includes(searchTerm)
      )
    }

    if (categoryFilter) {
      result = result.filter(book => book.category?.categoryId === parseInt(categoryFilter))
    }

    if (authorFilter) {
      result = result.filter(book => book.author?.authorId === parseInt(authorFilter))
    }

    if (publisherFilter) {
      result = result.filter(book => book.publisher?.publisherId === parseInt(publisherFilter))
    }

    if (priceRange.min) {
      result = result.filter(book => book.price >= parseFloat(priceRange.min))
    }

    if (priceRange.max) {
      result = result.filter(book => book.price <= parseFloat(priceRange.max))
    }

    if (stockFilter === 'in-stock') {
      result = result.filter(book => book.stockQuantity > 0)
    } else if (stockFilter === 'out-of-stock') {
      result = result.filter(book => book.stockQuantity === 0)
    }

    setFilteredBooks(result)
    setCurrentPage(1)
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleCategoryFilterChange = (e) => {
    setCategoryFilter(e.target.value)
  }

  const handleAuthorFilterChange = (e) => {
    setAuthorFilter(e.target.value)
  }

  const handlePublisherFilterChange = (e) => {
    setPublisherFilter(e.target.value)
  }

  const handlePriceRangeChange = (e) => {
    const { name, value } = e.target
    setPriceRange(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleStockFilterChange = (e) => {
    setStockFilter(e.target.value)
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setCategoryFilter('')
    setAuthorFilter('')
    setPublisherFilter('')
    setPriceRange({ min: '', max: '' })
    setStockFilter('')
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
      isbn: '',
      publicationYear: '',
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
      categoryId: book.category?.categoryId || '',
      authorId: book.author?.authorId || '',
      publisherId: book.publisher?.publisherId || '',
      isbn: book.isbn || '',
      publicationYear: book.publicationYear || '',
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
    showSuccess('✅ Hình ảnh tải lên thành công!')
    setMessage('Hình ảnh tải lên thành công!')
    setTimeout(() => setMessage(''), 2000)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    
    if (!formData.title || !formData.price || !formData.stockQuantity) {
      const msg = 'Vui lòng điền đầy đủ thông tin bắt buộc'
      setError(msg)
      showError('❌ ' + msg)
      return
    }

    // Validate ISBN format if provided
    if (formData.isbn && !/^[0-9\-]{10,17}$/.test(formData.isbn)) {
      const msg = 'ISBN không hợp lệ (định dạng: 10-17 ký tự số và dấu gạch ngang)'
      setError(msg)
      showError('❌ ' + msg)
      return
    }

    // Validate publication year if provided
    if (formData.publicationYear && (isNaN(formData.publicationYear) || formData.publicationYear < 1000 || formData.publicationYear > new Date().getFullYear())) {
      const msg = 'Năm xuất bản không hợp lệ'
      setError(msg)
      showError('❌ ' + msg)
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
        isbn: formData.isbn || null,
        publicationYear: formData.publicationYear ? parseInt(formData.publicationYear) : null,
        coverImageUrl: formData.coverImageUrl
      }

      if (editingId) {
        await api.put(`/books/${editingId}`, bookData)
        showSuccess('✅ Cập nhật sách thành công!')
        setMessage('Cập nhật sách thành công!')
      } else {
        await api.post('/books', bookData)
        showSuccess('✅ Thêm sách thành công!')
        setMessage('Thêm sách thành công!')
      }
      
      setShowModal(false)
      fetchBooks()
      setTimeout(() => setMessage(''), 2000)
    } catch (err) {
      const errorMsg = editingId ? 'Lỗi cập nhật sách. Vui lòng thử lại.' : 'Lỗi thêm sách. Vui lòng thử lại.'
      setError(errorMsg)
      showError('❌ ' + errorMsg)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBook = (bookId) => {
    const book = books.find(b => b.bookId === bookId)
    setDeleteTarget({ id: bookId, title: book?.title || 'Sách' })
    setShowDeleteConfirm(true)
  }

  const confirmDeleteBook = async () => {
    if (!deleteTarget) return
    try {
      setLoading(true)
      await api.delete(`/books/${deleteTarget.id}`)
      showSuccess('✅ Xóa sách thành công!')
      setMessage('Xóa sách thành công!')
      setShowDeleteConfirm(false)
      setDeleteTarget(null)
      fetchBooks()
      setTimeout(() => setMessage(''), 2000)
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Lỗi xóa sách'
      setError(errorMsg)
      showError('❌ ' + errorMsg)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-page">
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="admin-header">
        <h1>Quản Lý Sách</h1>
        <button className="btn-add" onClick={handleAddBook}>Thêm Sách</button>
      </div>

      <div className="filter-section">
        <div className="filter-row">
          <div className="filter-group" style={{ flex: 1 }}>
            <label>Tìm Kiếm</label>
            <input 
              type="text" 
              placeholder="Tìm theo tên sách hoặc ISBN..." 
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="filter-group">
            <label>Danh Mục</label>
            <select value={categoryFilter} onChange={handleCategoryFilterChange}>
              <option value="">-- Tất cả --</option>
              {categories.map(cat => (
                <option key={cat.categoryId} value={cat.categoryId}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Tác Giả</label>
            <select value={authorFilter} onChange={handleAuthorFilterChange}>
              <option value="">-- Tất cả --</option>
              {authors.map(author => (
                <option key={author.authorId} value={author.authorId}>
                  {author.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="filter-row">
          <div className="filter-group">
            <label>Nhà Xuất Bản</label>
            <select value={publisherFilter} onChange={handlePublisherFilterChange}>
              <option value="">-- Tất cả --</option>
              {publishers.map(pub => (
                <option key={pub.publisherId} value={pub.publisherId}>
                  {pub.name}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Giá Từ</label>
            <input 
              type="number" 
              name="min"
              placeholder="Giá tối thiểu" 
              value={priceRange.min}
              onChange={handlePriceRangeChange}
            />
          </div>
          <div className="filter-group">
            <label>Giá Đến</label>
            <input 
              type="number" 
              name="max"
              placeholder="Giá tối đa" 
              value={priceRange.max}
              onChange={handlePriceRangeChange}
            />
          </div>
          <div className="filter-group">
            <label>Tình Trạng Kho</label>
            <select value={stockFilter} onChange={handleStockFilterChange}>
              <option value="">-- Tất cả --</option>
              <option value="in-stock">Còn hàng</option>
              <option value="out-of-stock">Hết hàng</option>
            </select>
          </div>
          <div className="filter-actions" style={{ alignItems: 'flex-end' }}>
            <button className="btn-secondary" onClick={handleClearFilters}>Xóa Bộ Lọc</button>
          </div>
        </div>
      </div>

      <div className="results-info">
        <p>Hiển thị {filteredBooks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).length} / {filteredBooks.length} kết quả</p>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tiêu Đề</th>
              <th>Tác Giả</th>
              <th>Nhà Xuất Bản</th>
              <th>Giá</th>
              <th>Số Lượng</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {filteredBooks.length === 0 ? (
              <tr><td colSpan="7" style={{textAlign: 'center'}}>Không có dữ liệu</td></tr>
            ) : (
              filteredBooks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(book => (
                <tr key={book.bookId}>
                  <td>{book.bookId}</td>
                  <td>{book.title}</td>
                  <td>{book.author?.name || '-'}</td>
                  <td>{book.publisher?.name || '-'}</td>
                  <td>{book.price?.toLocaleString()} VND</td>
                  <td>{book.stockQuantity}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-edit" title="Sửa" onClick={() => handleEditBook(book)}>✏️</button>
                      <button className="btn-delete" title="Xóa" onClick={() => handleDeleteBook(book.bookId)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {books.length > 0 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            ← Trước
          </button>
          <span>Trang {currentPage} / {Math.ceil(filteredBooks.length / itemsPerPage)}</span>
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredBooks.length / itemsPerPage)))}
            disabled={currentPage === Math.ceil(filteredBooks.length / itemsPerPage)}
          >
            Sau →
          </button>
        </div>
      )}

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
                  <select 
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(cat => (
                      <option key={cat.categoryId} value={cat.categoryId}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Tác Giả</label>
                  <select 
                    name="authorId"
                    value={formData.authorId}
                    onChange={handleInputChange}
                  >
                    <option value="">-- Chọn tác giả --</option>
                    {authors.map(author => (
                      <option key={author.authorId} value={author.authorId}>
                        {author.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Nhà Xuất Bản</label>
                <select 
                  name="publisherId"
                  value={formData.publisherId}
                  onChange={handleInputChange}
                >
                  <option value="">-- Chọn nhà xuất bản --</option>
                  {publishers.map(pub => (
                    <option key={pub.publisherId} value={pub.publisherId}>
                      {pub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>ISBN</label>
                  <input 
                    type="text" 
                    name="isbn"
                    placeholder="ISBN (vd: 978-3-16-148410-0)" 
                    value={formData.isbn}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Năm Xuất Bản</label>
                  <input 
                    type="number" 
                    name="publicationYear"
                    placeholder="Năm xuất bản" 
                    value={formData.publicationYear}
                    onChange={handleInputChange}
                    min="1000"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Hình Ảnh Bìa</label>
                <ImageUpload 
                  onImageUpload={handleImageUpload}
                  type="book-cover"
                  folder="book-covers"
                  bookId={editingId}
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

      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        title={deleteTarget?.title}
        message="Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa?"
        onConfirm={confirmDeleteBook}
        onCancel={() => {
          setShowDeleteConfirm(false)
          setDeleteTarget(null)
        }}
        isLoading={loading}
      />
    </div>
  )
}

export default AdminBooks
