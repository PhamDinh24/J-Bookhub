import { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { CartContext } from '../context/CartContext'
import './Header.css'

function Header() {
  const { isAuthenticated, user, logout } = useContext(AuthContext)
  const { cartItems } = useContext(CartContext)
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          📚 Bookstore
        </Link>
        <nav className="nav">
          <Link to="/">Trang Chủ</Link>
          <Link to="/books">Sách</Link>
          <Link to="/cart" className="cart-link">
            🛒 Giỏ Hàng
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
          {isAuthenticated ? (
            <>
              <div className="user-menu">
                <span className="user-name">
                  {isAdmin ? '👨‍💼' : '👤'} {user?.fullName || 'Người dùng'}
                </span>
                <div className="dropdown-menu">
                  {isAdmin && (
                    <>
                      <Link to="/admin" className="admin-link">⚙️ Admin Panel</Link>
                      <hr className="menu-divider" />
                    </>
                  )}
                  <Link to="/profile">👤 Tài Khoản Của Tôi</Link>
                  <Link to="/orders">📦 Đơn Hàng</Link>
                  <button onClick={handleLogout} className="logout-btn">🚪 Đăng Xuất</button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/login">Đăng Nhập</Link>
              <Link to="/signup">Đăng Ký</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header
