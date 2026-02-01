import { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import api from '../services/api'
import '../styles/Login.css'

function Signup() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useContext(AuthContext)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!formData.fullName.trim()) {
      setError('Vui lòng nhập họ và tên')
      return
    }

    if (!formData.email.trim()) {
      setError('Vui lòng nhập email')
      return
    }

    if (!formData.password.trim()) {
      setError('Vui lòng nhập mật khẩu')
      return
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu không khớp')
      return
    }

    setLoading(true)

    try {
      const response = await api.post('/auth/register', {
        email: formData.email.trim(),
        password: formData.password.trim(),
        fullName: formData.fullName.trim()
      })

      const data = response.data

      if (data.success) {
        login({
          userId: data.userId,
          email: data.email,
          fullName: data.fullName,
          role: data.role
        }, data.token)

        navigate('/')
      } else {
        setError(data.error || 'Đăng ký thất bại')
      }
    } catch (err) {
      console.error('Signup error:', err)
      const errorMsg = err.response?.data?.error || err.message || 'Lỗi đăng ký'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-form">
        <h1>Đăng Ký</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Họ và Tên</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Nhập họ và tên"
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Nhập email"
              required
            />
          </div>

          <div className="form-group">
            <label>Mật Khẩu</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
              required
            />
          </div>

          <div className="form-group">
            <label>Xác Nhận Mật Khẩu</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Nhập lại mật khẩu"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Đang đăng ký...' : 'Đăng Ký'}
          </button>
        </form>
        <p className="signup-link">
          Đã có tài khoản? <Link to="/login">Đăng Nhập</Link>
        </p>
      </div>
    </div>
  )
}

export default Signup
