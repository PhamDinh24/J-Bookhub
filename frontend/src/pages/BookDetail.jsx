import { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { CartContext } from '../context/CartContext'
import bookService from '../services/bookService'
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
    for (let i = 0; i < quantity; i++) {
      addToCart(book)
    }
    alert('Đã thêm vào giỏ hàng!')
    navigate('/cart')
  }

  if (loading) return <div className="loading">Đang tải...</div>
  if (!book) return <div className="loading">Không tìm thấy sách</div>

  const averageRating = book.reviews && book.reviews.length > 0
    ? (book.reviews.reduce((sum, r) => sum + r.rating, 0) / book.reviews.length).toFixed(1)
    : 0

  return (
    <div className="book-detail-container">
      <button onClick={() => navigate('/books')} style={{ marginBottom: '1rem' }}>← Quay lại</button>
      <div className="book-detail-content">
        <div className="book-image">
          <img src={book.coverImageUrl || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="400"%3E%3Crect fill="%23ddd" width="300" height="400"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="16" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E'} alt={book.title} />
        </div>
        <div className="book-info">
          <h1>{book.title}</h1>
          <p className="author">Tác giả: {book.author?.name || 'Không xác định'}</p>
          <p className="publisher">Nhà xuất bản: {book.publisher?.name || 'Không xác định'}</p>
          <p className="category">Danh mục: {book.category?.name || 'Không xác định'}</p>
          <p className="description">{book.description}</p>
          
          <div className="book-meta">
            <div className="price">{book.price?.toLocaleString()} VND</div>
            <div className="stock">
              {book.stockQuantity > 0 ? (
                <span className="in-stock">Còn hàng ({book.stockQuantity})</span>
              ) : (
                <span className="out-of-stock">Hết hàng</span>
              )}
            </div>
            {book.reviews && book.reviews.length > 0 && (
              <div className="rating">
                ⭐ {averageRating} ({book.reviews.length} nhận xét)
              </div>
            )}
          </div>

          <div className="quantity-selector">
            <label>Số lượng:</label>
            <input
              type="number"
              min="1"
              max={book.stockQuantity}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
            />
          </div>

          <button 
            className="btn btn-primary btn-large"
            onClick={handleAddToCart}
            disabled={book.stockQuantity === 0}
          >
            Thêm Vào Giỏ Hàng
          </button>
        </div>
      </div>

      {book.reviews && book.reviews.length > 0 && (
        <section className="reviews-section">
          <h2>💬 Nhận Xét Từ Khách Hàng ({book.reviews.length})</h2>
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
          <h2>📚 Sách Liên Quan Trong Danh Mục</h2>
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
                  <p className="book-price">{relatedBook.price?.toLocaleString()} VND</p>
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
