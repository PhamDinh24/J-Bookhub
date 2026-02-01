import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Về Chúng Tôi</h3>
          <p>Bookstore - Nơi mua sách trực tuyến uy tín</p>
        </div>
        <div className="footer-section">
          <h3>Liên Hệ</h3>
          <p>Email: info@bookstore.com</p>
          <p>Phone: 0123456789</p>
        </div>
        <div className="footer-section">
          <h3>Theo Dõi</h3>
          <p>Facebook | Twitter | Instagram</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 Bookstore. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
