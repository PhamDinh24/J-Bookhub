import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { CartContext } from '../context/CartContext'
import { showSuccess, showError } from '../utils/toastNotifications'
import '../styles/Cart.css'

function Cart() {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    toggleItemSelection,
    selectAllItems,
    deselectAllItems,
    getSelectedItems,
    getSelectedTotalPrice
  } = useContext(CartContext)
  const navigate = useNavigate()

  const selectedItems = getSelectedItems()
  const selectedTotalPrice = getSelectedTotalPrice()
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const allSelected = cartItems.length > 0 && cartItems.every(item => item.selected)

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      showError('❌ Vui lòng chọn ít nhất một sách để thanh toán')
      return
    }
    navigate('/checkout')
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1>Giỏ Hàng Của Tôi</h1>
        <p className="cart-subtitle">Quản lý sách và thanh toán</p>
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-icon">🛒</div>
          <h2>Giỏ hàng của bạn trống</h2>
          <p>Hãy thêm sách để bắt đầu mua sắm</p>
          <a href="/books" className="btn btn-primary">
            Khám Phá Sách
          </a>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-main">
            <div className="cart-toolbar">
              <label className="select-all-checkbox">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => allSelected ? deselectAllItems() : selectAllItems()}
                />
                <span>{allSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}</span>
              </label>
              <span className="cart-count">
                {cartItems.length} sách trong giỏ
              </span>
            </div>

            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.bookId} className={`cart-item ${item.selected ? 'selected' : ''}`}>
                  <div className="item-checkbox">
                    <input
                      type="checkbox"
                      checked={item.selected || false}
                      onChange={() => toggleItemSelection(item.bookId)}
                    />
                  </div>
                  
                  <div className="item-image">
                    <img 
                      src={item.coverImageUrl || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="120"%3E%3Crect fill="%23ddd" width="80" height="120"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="12" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E'} 
                      alt={item.title}
                    />
                  </div>

                  <div className="item-details">
                    <h3>{item.title}</h3>
                    <p className="item-author">{item.author?.name || 'Tác giả không xác định'}</p>
                    <p className="item-price">{item.price?.toLocaleString('vi-VN')} ₫</p>
                  </div>

                  <div className="item-quantity">
                    <button 
                      onClick={() => updateQuantity(item.bookId, Math.max(1, item.quantity - 1))}
                      className="qty-btn"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value)
                        if (val > 0) {
                          updateQuantity(item.bookId, val)
                        }
                      }}
                      className="qty-input"
                    />
                    <button 
                      onClick={() => updateQuantity(item.bookId, item.quantity + 1)}
                      className="qty-btn"
                    >
                      +
                    </button>
                  </div>

                  <div className="item-total">
                    <span className="total-price">
                      {(item.price * item.quantity)?.toLocaleString('vi-VN')} ₫
                    </span>
                  </div>

                  <button 
                    className="item-delete"
                    onClick={() => {
                      removeFromCart(item.bookId)
                      showSuccess('✅ Xóa khỏi giỏ hàng thành công!')
                    }}
                    title="Xóa sách"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <aside className="cart-sidebar">
            <div className="cart-summary">
              <h2>Tóm Tắt Đơn Hàng</h2>
              
              <div className="summary-section">
                <div className="summary-row">
                  <span>Tổng tiền (tất cả):</span>
                  <span className="amount">{totalPrice?.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="summary-row highlight">
                  <span>Tổng tiền (đã chọn):</span>
                  <span className="amount-selected">{selectedTotalPrice?.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="summary-row">
                  <span>Số sách đã chọn:</span>
                  <span className="count">{selectedItems.length}/{cartItems.length}</span>
                </div>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-total">
                <span>Thanh toán:</span>
                <span className="final-price">{selectedTotalPrice?.toLocaleString('vi-VN')} ₫</span>
              </div>

              <button 
                className="btn btn-primary btn-checkout"
                onClick={handleCheckout}
                disabled={selectedItems.length === 0}
              >
                Thanh Toán ({selectedItems.length} sách)
              </button>

              <button 
                className="btn btn-secondary btn-continue"
                onClick={() => navigate('/books')}
              >
                Tiếp Tục Mua Sắm
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}

export default Cart
