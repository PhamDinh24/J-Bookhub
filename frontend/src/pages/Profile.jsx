import { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import ImageUpload from '../components/ImageUpload'
import api from '../services/api'
import { showSuccess, showError } from '../utils/toastNotifications'
import '../styles/Profile.css'

function Profile() {
  const { user, isAuthenticated, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('info')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    avatar: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        avatar: user.avatar || ''
      })
    }
  }, [user, isAuthenticated, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      await api.put(`/users/${user.userId}`, formData)
      showSuccess('✅ Cập nhật thông tin thành công!')
      setMessage('Cập nhật thông tin thành công!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Lỗi cập nhật thông tin'
      setError(errorMsg)
      showError('❌ ' + errorMsg)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    const oldPassword = e.target.oldPassword.value
    const newPassword = e.target.newPassword.value
    const confirmPassword = e.target.confirmPassword.value

    if (newPassword !== confirmPassword) {
      const msg = 'Mật khẩu mới không khớp'
      setError(msg)
      showError('❌ ' + msg)
      return
    }

    setLoading(true)
    setMessage('')
    setError('')

    try {
      await api.post(`/users/${user.userId}/change-password`, {
        oldPassword,
        newPassword
      })
      showSuccess('✅ Đổi mật khẩu thành công!')
      setMessage('Đổi mật khẩu thành công!')
      e.target.reset()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Lỗi đổi mật khẩu. Vui lòng kiểm tra mật khẩu hiện tại.'
      setError(errorMsg)
      showError('❌ ' + errorMsg)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = (imageUrl) => {
    setFormData(prev => ({
      ...prev,
      avatar: imageUrl
    }))
    showSuccess('✅ Hình ảnh đại diện tải lên thành công!')
    setMessage('Hình ảnh đại diện tải lên thành công!')
    setTimeout(() => setMessage(''), 2000)
  }

  const handleLogout = () => {
    logout()
    showSuccess('✅ Đăng xuất thành công!')
    navigate('/')
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Tài Khoản Của Tôi</h1>
        <p>Quản lý thông tin cá nhân và đơn hàng</p>
      </div>

      <div className="profile-content">
        <aside className="profile-sidebar">
          <div className="profile-card">
            <div className="profile-avatar">
              {formData.avatar ? (
                <img src={formData.avatar} alt="Avatar" />
              ) : (
                '👤'
              )}
            </div>
            <h3>{user?.fullName || 'Người dùng'}</h3>
            <p>{user?.email}</p>
          </div>

          <nav className="profile-menu">
            <button
              className={`menu-item ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              Thông Tin Cá Nhân
            </button>
            <button
              className={`menu-item ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => setActiveTab('password')}
            >
              Đổi Mật Khẩu
            </button>
            <button
              className={`menu-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              Đơn Hàng Của Tôi
            </button>
            <button
              className="menu-item logout"
              onClick={handleLogout}
            >
              Đăng Xuất
            </button>
          </nav>
        </aside>

        <main className="profile-main">
          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}

          {activeTab === 'info' && (
            <section className="profile-section">
              <h2>Thông Tin Cá Nhân</h2>
              <form onSubmit={handleUpdateProfile}>
                <div className="form-group">
                  <label>Hình Ảnh Đại Diện</label>
                  <ImageUpload 
                    onImageUpload={handleAvatarUpload}
                    type="avatar"
                    folder="avatars"
                  />
                  {formData.avatar && (
                    <div className="avatar-preview">
                      <img src={formData.avatar} alt="Avatar" />
                      <p>Hình ảnh đã tải lên</p>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Họ và Tên</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>Số Điện Thoại</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Địa Chỉ</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="4"
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Đang cập nhật...' : 'Cập Nhật Thông Tin'}
                </button>
              </form>
            </section>
          )}

          {activeTab === 'password' && (
            <section className="profile-section">
              <h2>Đổi Mật Khẩu</h2>
              <form onSubmit={handleChangePassword}>
                <div className="form-group">
                  <label>Mật Khẩu Hiện Tại</label>
                  <input
                    type="password"
                    name="oldPassword"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Mật Khẩu Mới</label>
                  <input
                    type="password"
                    name="newPassword"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Xác Nhận Mật Khẩu Mới</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Đang đổi...' : 'Đổi Mật Khẩu'}
                </button>
              </form>
            </section>
          )}

          {activeTab === 'orders' && (
            <section className="profile-section">
              <h2>Đơn Hàng Của Tôi</h2>
              <p style={{ textAlign: 'center', color: '#666' }}>
                Xem chi tiết đơn hàng tại <a href="/orders">trang Đơn Hàng</a>
              </p>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}

export default Profile
