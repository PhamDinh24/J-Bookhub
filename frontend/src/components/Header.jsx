import { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { CartContext } from '../context/CartContext'
import './Header.css'

function Header() {
  const { isAuthenticated, user, logout } = useContext(AuthContext)
  const { cartItems } = useContext(CartContext)
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const isAdmin = user?.role === 'admin'
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)

  const handleLogout = () => {
    logout()
    setShowDropdown(false)
    setShowMobileMenu(false)
    navigate('/')
  }

  const handleNavClick = () => {
    setShowMobileMenu(false)
    setShowDropdown(false)
  }

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo" onClick={handleNavClick}>
          J-Bookhub
        </Link>
        
        <nav className={`nav ${showMobileMenu ? 'mobile-open' : ''}`}>
          <Link to="/" onClick={handleNavClick}>Trang Chủ</Link>
          <Link to="/books" onClick={handleNavClick}>Sách</Link>
          <Link to="/cart" className="cart-link" onClick={handleNavClick}>
            Giỏ Hàng
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
          {isAuthenticated && (
            <Link to="/orders" className="orders-link" onClick={handleNavClick}>
              Đơn Hàng
            </Link>
          )}
        </nav>

        <div className="header-right">
          {isAuthenticated ? (
            <div className="user-menu-wrapper">
              <button 
                className="user-menu-btn"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                {user?.fullName || 'Người dùng'}
              </button>
              {showDropdown && (
                <div className="dropdown-menu">
                  {isAdmin && (
                    <>
                      <Link to="/admin" className="admin-link" onClick={handleNavClick}>
                        Admin Panel
                      </Link>
                      <hr className="menu-divider" />
                    </>
                  )}
                  <Link to="/profile" onClick={handleNavClick}>Tài Khoản</Link>
                  <button onClick={handleLogout} className="logout-btn">Đăng Xuất</button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" onClick={handleNavClick}>Đăng Nhập</Link>
              <Link to="/signup" className="btn-signup" onClick={handleNavClick}>Đăng Ký</Link>
            </div>
          )}
        </div>

        <button className="mobile-menu-btn" onClick={() => setShowMobileMenu(!showMobileMenu)}>
          ☰
        </button>
      </div>
    </header>
  )
}

export default Header
