import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import api from '../services/api'
import '../styles/Login.css'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useContext(AuthContext)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!email.trim() || !password.trim()) {
        setError('Vui lòng nhập email và mật khẩu')
        setLoading(false)
        return
      }

      const response = await api.post('/auth/login', {
        email: email.trim(),
        password: password.trim()
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
        setError(data.error || 'Đăng nhập thất bại')
      }
    } catch (err) {
      console.error('Login error:', err)
      const errorMsg = err.response?.data?.error || err.message || 'Lỗi đăng nhập'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-form">
        <h1>Đăng Nhập</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              required
            />
          </div>
          <div className="form-group">
            <label>Mật Khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
          </button>
        </form>
        <p className="signup-link">
          Chưa có tài khoản? <a href="/signup">Đăng Ký</a>
        </p>
      </div>
    </div>
  )
}

export default Login
