import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Về J-Bookhub</h3>
          <p>J-Bookhub là nền tảng bán sách trực tuyến hàng đầu, cung cấp hàng ngàn cuốn sách từ các tác giả nổi tiếng trên toàn thế giới.</p>
          <p style={{marginTop: '1rem', fontSize: '0.9rem', opacity: 0.7}}>Thành lập năm 2024 • Phục vụ hơn 10,000 khách hàng</p>
        </div>
        <div className="footer-section">
          <h3>Liên Hệ & Hỗ Trợ</h3>
          <ul>
            <li><a href="mailto:support@jbookhub.com">support@jbookhub.com</a></li>
            <li><a href="tel:0123456789">0123 456 789</a></li>
            <li><a href="#">Chat trực tuyến 24/7</a></li>
            <li><a href="#">Câu hỏi thường gặp</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Liên Kết Nhanh</h3>
          <ul>
            <li><a href="/">Trang chủ</a></li>
            <li><a href="/books">Danh sách sách</a></li>
            <li><a href="#">Điều khoản sử dụng</a></li>
            <li><a href="#">Chính sách bảo mật</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Theo Dõi Chúng Tôi</h3>
          <div className="social-links">
            <a href="#" className="social-link">Facebook</a>
            <a href="#" className="social-link">Twitter</a>
            <a href="#" className="social-link">Instagram</a>
            <a href="#" className="social-link">YouTube</a>
          </div>
          <p style={{marginTop: '1.5rem', fontSize: '0.9rem'}}>Đăng ký nhận tin tức mới nhất</p>
          <div style={{display: 'flex', gap: '0.5rem', marginTop: '0.8rem'}}>
            <input 
              type="email" 
              placeholder="Email của bạn" 
              style={{
                flex: 1,
                padding: '0.6rem',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.9rem'
              }}
            />
            <button style={{
              padding: '0.6rem 1.2rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}>Đăng ký</button>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 J-Bookhub. Tất cả quyền được bảo lưu. | Thiết kế bởi <strong>J-Bookhub Team</strong></p>
      </div>
    </footer>
  )
}

export default Footer
