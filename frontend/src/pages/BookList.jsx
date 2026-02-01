import { useState, useEffect, useContext } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CartContext } from '../context/CartContext'
import bookService from '../services/bookService'
import '../styles/BookList.css'

function BookList() {
  const [books, setBooks] = useState([])
  const [filteredBooks, setFilteredBooks] = useState([])
  const [categories, setCategories] = useState([])
  const [authors, setAuthors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [priceRange, setPriceRange] = useState('all')
  const [stockFilter, setStockFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [authorFilter, setAuthorFilter] = useState('all')
  const { addToCart } = useContext(CartContext)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    // Check if category is in URL params
    const categoryParam = searchParams.get('category')
    if (categoryParam) {
      setCategoryFilter(categoryParam)
    }
  }, [searchParams])

  useEffect(() => {
    fetchBooks()
    fetchCategories()
    fetchAuthors()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [books, searchKeyword, sortBy, priceRange, stockFilter, categoryFilter, authorFilter])

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const response = await bookService.getAllBooks()
      setBooks(response.data || [])
      setError(null)
    } catch (err) {
      setError('Lỗi khi tải sách')
      console.error('Error fetching books:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/categories')
      const data = await response.json()
      setCategories(data || [])
    } catch (err) {
      console.error('Lỗi khi tải danh mục:', err)
      setCategories([])
    }
  }

  const fetchAuthors = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/authors')
      const data = await response.json()
      setAuthors(data || [])
    } catch (err) {
      console.error('Lỗi khi tải tác giả:', err)
      setAuthors([])
    }
  }

  const applyFilters = () => {
    let filtered = [...books]

    if (searchKeyword.trim()) {
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(searchKeyword.toLowerCase())
      )
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(book => book.categoryId === parseInt(categoryFilter))
    }

    if (authorFilter !== 'all') {
      filtered = filtered.filter(book => book.authorId === parseInt(authorFilter))
    }

    if (priceRange !== 'all') {
      filtered = filtered.filter(book => {
        const price = book.price || 0
        switch (priceRange) {
          case 'under50k':
            return price < 50000
          case '50k-100k':
            return price >= 50000 && price < 100000
          case '100k-200k':
            return price >= 100000 && price < 200000
          case 'over200k':
            return price >= 200000
          default:
            return true
        }
      })
    }

    if (stockFilter === 'instock') {
      filtered = filtered.filter(book => book.stockQuantity > 0)
    } else if (stockFilter === 'outofstock') {
      filtered = filtered.filter(book => book.stockQuantity === 0)
    }

    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => (b.bookId || 0) - (a.bookId || 0))
        break
      case 'price-low':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0))
        break
      case 'price-high':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0))
        break
      case 'popular':
        filtered.sort((a, b) => (b.stockQuantity || 0) - (a.stockQuantity || 0))
        break
      default:
        break
    }

    setFilteredBooks(filtered)
  }

  const handleSearch = (e) => {
    e.preventDefault()
  }

  const handleAddToCart = (book) => {
    addToCart(book)
    alert('Đã thêm vào giỏ hàng!')
  }

  const handleViewDetail = (bookId) => {
    navigate(`/books/${bookId}`)
  }

  if (loading) {
    return <div className="loading">Đang tải...</div>
  }

  return (
    <div className="book-list-page">
      <div className="book-list-header">
        <h1>Danh Sách Sách</h1>
        
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Tìm kiếm sách..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          <button type="submit">Tìm Kiếm</button>
        </form>

        {error && <div className="error-message">{error}</div>}
      </div>

      <div className="book-list-content">
        <main className="books-main">
          <div className="results-info">
            Tìm thấy {filteredBooks.length} sách
          </div>

          <div className="books-grid">
            {filteredBooks.map((book) => (
              <div key={book.bookId} className="book-card">
                <div className="book-image-wrapper">
                  <img 
                    src={book.coverImageUrl || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="250"%3E%3Crect fill="%23ddd" width="200" height="250"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="14" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E'} 
                    alt={book.title}
                    onClick={() => handleViewDetail(book.bookId)}
                    className="book-image"
                  />
                  {book.stockQuantity === 0 && <div className="out-of-stock-badge">Hết Hàng</div>}
                </div>
                <div className="book-info">
                  <h3 className="book-title">{book.title}</h3>
                  <p className="book-author">Tác giả: {book.author?.name || 'Không xác định'}</p>
                  <p className="book-publisher">NXB: {book.publisher?.name || 'Không xác định'}</p>
                  <p className="book-price">{book.price?.toLocaleString()} VND</p>
                  <button 
                    className="btn-add-cart"
                    onClick={() => handleAddToCart(book)}
                    disabled={book.stockQuantity === 0}
                  >
                    {book.stockQuantity > 0 ? 'Thêm Vào Giỏ' : 'Hết Hàng'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>

        <aside className="filters-sidebar">
          <h3>Bộ Lọc</h3>
          
          <div className="filter-group">
            <label>Danh mục:</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="all">Tất cả danh mục</option>
              {Array.isArray(categories) && categories.map((cat) => (
                <option key={cat.categoryId} value={cat.categoryId}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Tác giả:</label>
            <select value={authorFilter} onChange={(e) => setAuthorFilter(e.target.value)}>
              <option value="all">Tất cả tác giả</option>
              {Array.isArray(authors) && authors.map((author) => (
                <option key={author.authorId} value={author.authorId}>
                  {author.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Sắp xếp:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Mới nhất</option>
              <option value="price-low">Giá: Thấp → Cao</option>
              <option value="price-high">Giá: Cao → Thấp</option>
              <option value="popular">Phổ biến nhất</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Khoảng giá:</label>
            <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
              <option value="all">Tất cả</option>
              <option value="under50k">Dưới 50.000 ₫</option>
              <option value="50k-100k">50.000 - 100.000 ₫</option>
              <option value="100k-200k">100.000 - 200.000 ₫</option>
              <option value="over200k">Trên 200.000 ₫</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Tình trạng:</label>
            <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
              <option value="all">Tất cả</option>
              <option value="instock">Còn hàng</option>
              <option value="outofstock">Hết hàng</option>
            </select>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default BookList
