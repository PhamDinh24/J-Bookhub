import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { CartContext } from '../context/CartContext'
import '../styles/Cart.css'

function Cart() {
  const { cartItems, removeFromCart, updateQuantity } = useContext(CartContext)
  const navigate = useNavigate()

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  return (
    <div className="cart-container">
      <h1>Giỏ Hàng</h1>
      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>Giỏ hàng của bạn trống</p>
          <a href="/books" className="btn btn-primary">
            Tiếp Tục Mua Sắm
          </a>
        </div>
      ) : (
        <div className="cart-content">
          <table className="cart-table">
            <thead>
              <tr>
                <th>Sách</th>
                <th>Giá</th>
                <th>Số Lượng</th>
                <th>Tổng</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.bookId}>
                  <td>{item.title}</td>
                  <td>{item.price?.toLocaleString()} VND</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.bookId, parseInt(e.target.value))}
                    />
                  </td>
                  <td>{(item.price * item.quantity)?.toLocaleString()} VND</td>
                  <td>
                    <button 
                      className="btn-delete"
                      onClick={() => removeFromCart(item.bookId)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="cart-summary">
            <h3>Tóm Tắt Đơn Hàng</h3>
            <p>Tổng tiền: {totalPrice?.toLocaleString()} VND</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/checkout')}
            >
              Thanh Toán
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Cart
