import { Link } from 'react-router-dom'
import '../styles/NotFound.css'

function NotFound() {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="error-code">404</div>
        <h1>Trang Không Tìm Thấy</h1>
        <p>Xin lỗi, trang bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        
        <div className="suggestions">
          <h3>Bạn có thể:</h3>
          <ul>
            <li><Link to="/">Quay về Trang Chủ</Link></li>
            <li><Link to="/books">Xem Danh Sách Sách</Link></li>
            <li><Link to="/cart">Xem Giỏ Hàng</Link></li>
          </ul>
        </div>

        <div className="illustration">
          404
        </div>
      </div>
    </div>
  )
}

export default NotFound
