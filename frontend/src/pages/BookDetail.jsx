import { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { CartContext } from '../context/CartContext'
import bookService from '../services/bookService'
import { showSuccess, showError } from '../utils/toastNotifications'
import '../styles/BookDetail.css'

function BookDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [relatedBooks, setRelatedBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useContext(CartContext)

  useEffect(() => {
    fetchBook()
  }, [id])

  useEffect(() => {
    if (book && book.category) {
      fetchRelatedBooks()
    }
  }, [book])

  const fetchBook = async () => {
    try {
      setLoading(true)
      const response = await bookService.getBookById(parseInt(id))
      setBook(response.data)
    } catch (err) {
      console.error('Lỗi khi tải chi tiết sách:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedBooks = async () => {
    try {
      const response = await bookService.getBooksByCategory(book.category.categoryId)
      // Filter out current book and limit to 4 books
      const filtered = response.data
        .filter(b => b.bookId !== book.bookId)
        .slice(0, 4)
      setRelatedBooks(filtered)
    } catch (err) {
      console.error('Lỗi khi tải sách liên quan:', err)
    }
  }

  const handleAddToCart = () => {
    if (book.stockQuantity < quantity) {
      showError('❌ Số lượng tồn kho không đủ')
      return
    }
    for (let i = 0; i < quantity; i++) {
      addToCart(book)
    }
    showSuccess('✅ Thêm vào giỏ hàng thành công!')
    navigate('/cart')
  }

  if (loading) return <div className="loading">Đang tải...</div>
  if (!book) return <div className="loading">Không tìm thấy sách</div>

  const averageRating = book.reviews && book.reviews.length > 0
    ? (book.reviews.reduce((sum, r) => sum + r.rating, 0) / book.reviews.length).toFixed(1)
    : 0

  return (
    <div className="book-detail-container">
      <div className="breadcrumb">
        <button onClick={() => navigate('/books')} className="breadcrumb-link">← Quay lại</button>
      </div>
      
      <div className="book-detail-content">
        <div className="book-image-section">
          <div className="book-image">
            <img src={book.coverImageUrl || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="400"%3E%3Crect fill="%23ddd" width="300" height="400"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="16" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E'} alt={book.title} />
          </div>
        </div>

        <div className="book-info-section">
          <div className="book-header">
            <h1>{book.title}</h1>
            {book.reviews && book.reviews.length > 0 && (
              <div className="rating-badge">
                <span className="stars">{'⭐'.repeat(Math.round(averageRating))}</span>
                <span className="rating-text">{averageRating} ({book.reviews.length} đánh giá)</span>
              </div>
            )}
          </div>

          <div className="book-category-badge">
            {book.category?.name || 'Không xác định'}
          </div>

          <div className="book-price-section">
            <div className="price-display">{book.price?.toLocaleString('vi-VN')} ₫</div>
          </div>

          <div className="book-details-grid">
            <div className="detail-item">
              <span className="detail-label">Tác giả</span>
              <span className="detail-value">{book.author?.name || 'Không xác định'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Nhà xuất bản</span>
              <span className="detail-value">{book.publisher?.name || 'Không xác định'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Tình trạng</span>
              <span className="detail-value">
                {book.stockQuantity > 0 ? (
                  <span className="in-stock">✓ Còn hàng ({book.stockQuantity})</span>
                ) : (
                  <span className="out-of-stock">✗ Hết hàng</span>
                )}
              </span>
            </div>
          </div>

          <div className="book-description">
            <h3>Mô tả</h3>
            <p>{book.description}</p>
          </div>

          <div className="quantity-selector">
            <label>Số lượng:</label>
            <div className="quantity-input-group">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                −
              </button>
              <input
                type="number"
                min="1"
                max={book.stockQuantity}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              />
              <button 
                onClick={() => setQuantity(Math.min(book.stockQuantity, quantity + 1))}
                disabled={quantity >= book.stockQuantity}
              >
                +
              </button>
            </div>
          </div>

          <div className="action-buttons">
            <button 
              className="btn btn-primary btn-large"
              onClick={handleAddToCart}
              disabled={book.stockQuantity === 0}
            >
              Thêm Vào Giỏ Hàng
            </button>
            <button 
              className="btn btn-secondary btn-large"
              onClick={() => {
                if (book.stockQuantity < quantity) {
                  showError('❌ Số lượng tồn kho không đủ')
                  return
                }
                for (let i = 0; i < quantity; i++) {
                  addToCart(book)
                }
                showSuccess('✅ Thêm vào giỏ hàng thành công!')
                navigate('/checkout')
              }}
              disabled={book.stockQuantity === 0}
            >
              Mua Ngay
            </button>
          </div>
        </div>
      </div>

      {book.reviews && book.reviews.length > 0 && (
        <section className="reviews-section">
          <h2>Nhận Xét Từ Khách Hàng ({book.reviews.length})</h2>
          <div className="reviews-list">
            {book.reviews.map(review => (
              <div key={review.reviewId} className="review-item">
                <div className="review-header">
                  <span className="review-rating">{'⭐'.repeat(review.rating)}</span>
                  <span className="review-date">
                    {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <p className="review-comment">{review.comment}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {relatedBooks.length > 0 && (
        <section className="related-books">
          <h2>Sách Liên Quan Trong Danh Mục</h2>
          <div className="books-grid">
            {relatedBooks.map(relatedBook => (
              <Link 
                key={relatedBook.bookId} 
                to={`/books/${relatedBook.bookId}`}
                className="book-card"
              >
                <div className="book-card-image">
                  <img 
                    src={relatedBook.coverImageUrl || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="280"%3E%3Crect fill="%23ddd" width="200" height="280"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="14" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E'} 
                    alt={relatedBook.title}
                  />
                </div>
                <div className="book-card-info">
                  <h3>{relatedBook.title}</h3>
                  <p className="book-price">{relatedBook.price?.toLocaleString('vi-VN')} ₫</p>
                  <p className="book-stock">
                    {relatedBook.stockQuantity > 0 ? 'Còn hàng' : 'Hết hàng'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default BookDetail
