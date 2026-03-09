import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import bookService from '../services/bookService'
import categoryService from '../services/categoryService'
import { showError } from '../utils/toastNotifications'
import '../styles/Home.css'

function Home() {
  const [newBooks, setNewBooks] = useState([])
  const [bestsellerBooks, setBestsellerBooks] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [booksRes, categoriesRes] = await Promise.all([
        bookService.getAllBooks(),
        categoryService.getAllCategories()
      ])

      const books = booksRes.data || []
      const newest = books.slice(-8).reverse()
      setNewBooks(newest)

      const bestsellers = books
        .sort((a, b) => (b.stockQuantity || 0) - (a.stockQuantity || 0))
        .slice(0, 8)
      setBestsellerBooks(bestsellers)

      setCategories(categoriesRes.data || [])
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu:', err)
      const errorMsg = 'Không thể tải dữ liệu. Vui lòng thử lại sau.'
      setError(errorMsg)
      showError('❌ ' + errorMsg)
      setNewBooks([])
      setBestsellerBooks([])
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="home">
      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="hero-content">
          <h1>J-BOOKHUB</h1>
          <p>Khám Phá Thế Giới Sách Đa Dạng</p>
          <p className="hero-subtitle">Hàng ngàn cuốn sách từ các tác giả nổi tiếng</p>
          <Link to="/books" className="btn btn-primary btn-large">
            Mua Sách Ngay
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="feature-card">
          <div className="feature-icon">🚚</div>
          <h3>Giao Hàng Nhanh</h3>
          <p>Giao hàng trong 2-3 ngày</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">💳</div>
          <h3>Thanh Toán An Toàn</h3>
          <p>Nhiều phương thức thanh toán</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">💯</div>
          <h3>Hoàn Tiền 100%</h3>
          <p>Nếu không hài lòng</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📞</div>
          <h3>Hỗ Trợ 24/7</h3>
          <p>Luôn sẵn sàng giúp bạn</p>
        </div>
      </section>

      {error && <div className="error-banner">{error}</div>}

      {/* Categories Section */}
      <section className="categories-section">
        <div className="section-header">
          <h2>Danh Mục Sách</h2>
          <p>Tìm kiếm sách theo danh mục yêu thích</p>
        </div>
        <div className="categories-grid">
          {Array.isArray(categories) && categories.slice(0, 8).map((category) => (
            <Link 
              key={category.categoryId} 
              to={`/books?category=${category.categoryId}`}
              className="category-card"
              title={category.description}
            >
              <div className="category-icon">
                <span className="icon-text">{category.name.charAt(0).toUpperCase()}</span>
              </div>
              <h3>{category.name}</h3>
              <p className="category-desc">{category.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* New Books Section */}
      <section className="books-section">
        <div className="section-header">
          <h2>Sách Mới Nhất</h2>
          <Link to="/books" className="view-all">Xem tất cả →</Link>
        </div>
        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : newBooks.length === 0 ? (
          <div className="empty-state">Chưa có sách mới</div>
        ) : (
          <div className="books-grid-large">
            {newBooks.map(book => (
              <Link 
                key={book.bookId} 
                to={`/books/${book.bookId}`}
                className="book-card-large"
              >
                <div className="book-image-wrapper">
                  <img 
                    src={book.coverImageUrl || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="280"%3E%3Crect fill="%23ddd" width="200" height="280"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="14" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E'} 
                    alt={book.title}
                    loading="lazy"
                  />
                  <span className="badge new">Mới</span>
                </div>
                <div className="book-info">
                  <h3>{book.title}</h3>
                  <p className="author">{book.author?.name || 'Tác giả'}</p>
                  <p className="price">{book.price?.toLocaleString('vi-VN')} ₫</p>
                  <p className="stock">
                    {book.stockQuantity > 0 ? 'Còn hàng' : 'Hết hàng'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Bestsellers Section */}
      <section className="books-section">
        <div className="section-header">
          <h2>Sách Bán Chạy</h2>
          <Link to="/books" className="view-all">Xem tất cả →</Link>
        </div>
        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : bestsellerBooks.length === 0 ? (
          <div className="empty-state">Chưa có sách bán chạy</div>
        ) : (
          <div className="books-grid-large">
            {bestsellerBooks.map(book => (
              <Link 
                key={book.bookId} 
                to={`/books/${book.bookId}`}
                className="book-card-large"
              >
                <div className="book-image-wrapper">
                  <img 
                    src={book.coverImageUrl || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="280"%3E%3Crect fill="%23ddd" width="200" height="280"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="14" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E'} 
                    alt={book.title}
                    loading="lazy"
                  />
                  <span className="badge bestseller">Bán Chạy</span>
                </div>
                <div className="book-info">
                  <h3>{book.title}</h3>
                  <p className="author">{book.author?.name || 'Tác giả'}</p>
                  <p className="price">{book.price?.toLocaleString('vi-VN')} ₫</p>
                  <p className="stock">
                    {book.stockQuantity > 0 ? 'Còn hàng' : 'Hết hàng'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="newsletter-content">
          <h2>Đăng Ký Nhận Tin</h2>
          <p>Nhận thông tin về sách mới và khuyến mãi đặc biệt</p>
          <div className="newsletter-form">
            <input type="email" placeholder="Nhập email của bạn..." />
            <button className="btn btn-primary">Đăng Ký</button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
