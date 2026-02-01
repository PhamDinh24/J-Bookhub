import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import bookService from '../services/bookService'
import '../styles/Home.css'

function Home() {
  const [newBooks, setNewBooks] = useState([])
  const [bestsellerBooks, setBestsellerBooks] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBooks()
    fetchCategories()
  }, [])

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const response = await bookService.getAllBooks()
      const books = response.data || []

      // Get newest books (last 4 books)
      const newest = books.slice(-4).reverse()
      setNewBooks(newest)

      // Get bestsellers (books with highest stock as proxy for popularity)
      const bestsellers = books
        .sort((a, b) => (b.stockQuantity || 0) - (a.stockQuantity || 0))
        .slice(0, 4)
      setBestsellerBooks(bestsellers)
    } catch (err) {
      console.error('Lỗi khi tải sách:', err)
      setNewBooks([])
      setBestsellerBooks([])
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

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Chào Mừng Đến Bookstore</h1>
          <p>Khám phá hàng ngàn cuốn sách hay từ các tác giả nổi tiếng</p>
          <Link to="/books" className="btn btn-primary">
            Mua Sách Ngay
          </Link>
        </div>
      </section>

      <section className="features">
        <div className="feature-item">
          <h3>📦 Giao Hàng Nhanh</h3>
          <p>Giao hàng trong 2-3 ngày</p>
        </div>
        <div className="feature-item">
          <h3>💳 Thanh Toán An Toàn</h3>
          <p>Nhiều phương thức thanh toán</p>
        </div>
        <div className="feature-item">
          <h3>🔄 Hoàn Tiền 100%</h3>
          <p>Nếu không hài lòng</p>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="categories-header">
          <h2>📚 Danh Mục Sách</h2>
        </div>
        <div className="categories-grid">
          <Link to="/books" className="category-card">
            <span className="category-icon">📖</span>
            <h3>Tất Cả Sách</h3>
            <p>Khám phá toàn bộ</p>
          </Link>
          {Array.isArray(categories) && categories.map((category) => (
            <Link 
              key={category.categoryId} 
              to={`/books?category=${category.categoryId}`}
              className="category-card"
            >
              <span className="category-icon">📚</span>
              <h3>{category.name}</h3>
              <p>Khám phá danh mục</p>
            </Link>
          ))}
        </div>
      </section>

      {/* New Books Section */}
      <section className="books-section new-books-section">
        <div className="section-header">
          <h2>✨ Sách Mới Nhất</h2>
          <Link to="/books" className="view-all">Xem tất cả →</Link>
        </div>
        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : (
          <div className="books-grid">
            {newBooks.map(book => (
              <Link 
                key={book.bookId} 
                to={`/books/${book.bookId}`}
                className="book-card"
              >
                <div className="book-card-image">
                  <img 
                    src={book.coverImageUrl || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="280"%3E%3Crect fill="%23ddd" width="200" height="280"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="14" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E'} 
                    alt={book.title}
                  />
                  <span className="badge new">Mới</span>
                </div>
                <div className="book-card-info">
                  <h3>{book.title}</h3>
                  <p className="book-price">{book.price?.toLocaleString()} ₫</p>
                  <p className="book-stock">
                    {book.stockQuantity > 0 ? '✓ Còn hàng' : '✗ Hết hàng'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Bestsellers Section */}
      <section className="books-section bestsellers-section">
        <div className="section-header">
          <h2>🔥 Sách Bán Chạy</h2>
          <Link to="/books" className="view-all">Xem tất cả →</Link>
        </div>
        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : (
          <div className="books-grid">
            {bestsellerBooks.map(book => (
              <Link 
                key={book.bookId} 
                to={`/books/${book.bookId}`}
                className="book-card"
              >
                <div className="book-card-image">
                  <img 
                    src={book.coverImageUrl || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="280"%3E%3Crect fill="%23ddd" width="200" height="280"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="14" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E'} 
                    alt={book.title}
                  />
                  <span className="badge bestseller">Bán Chạy</span>
                </div>
                <div className="book-card-info">
                  <h3>{book.title}</h3>
                  <p className="book-price">{book.price?.toLocaleString()} ₫</p>
                  <p className="book-stock">
                    {book.stockQuantity > 0 ? '✓ Còn hàng' : '✗ Hết hàng'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Home
