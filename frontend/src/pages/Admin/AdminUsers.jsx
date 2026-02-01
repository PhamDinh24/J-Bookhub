import { useState, useEffect } from 'react'
import api from '../../services/api'

function AdminUsers() {
  const [users, setUsers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    role: 'customer'
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users')
      setUsers(response.data)
    } catch (err) {
      console.error('Error fetching users:', err)
      setError('Lỗi tải danh sách người dùng')
    }
  }

  const handleEditUser = (user) => {
    setEditingId(user.userId)
    setFormData({
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      address: user.address || '',
      role: user.role || 'customer'
    })
    setMessage('')
    setError('')
    setShowModal(true)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    
    if (!formData.fullName || !formData.email) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const userData = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        role: formData.role
      }

      await api.put(`/users/${editingId}`, userData)
      setMessage('Cập nhật người dùng thành công!')
      setShowModal(false)
      fetchUsers()
      setTimeout(() => setMessage(''), 2000)
    } catch (err) {
      setError('Lỗi cập nhật người dùng. Vui lòng thử lại.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        await api.delete(`/users/${userId}`)
        setMessage('Xóa người dùng thành công!')
        fetchUsers()
        setTimeout(() => setMessage(''), 2000)
      } catch (err) {
        setError('Lỗi xóa người dùng')
        console.error(err)
      }
    }
  }

  return (
    <div>
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="admin-header">
        <h1>Quản Lý Người Dùng</h1>
      </div>

      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>Email</th>
              <th>Số Điện Thoại</th>
              <th>Vai Trò</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan="6" style={{textAlign: 'center'}}>Không có dữ liệu</td></tr>
            ) : (
              users.map(user => (
                <tr key={user.userId}>
                  <td>{user.userId}</td>
                  <td>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>{user.phoneNumber || '-'}</td>
                  <td>
                    <span className={`role-badge role-${user.role}`}>
                      {user.role === 'admin' ? '👨‍💼 Admin' : '👤 Khách hàng'}
                    </span>
                  </td>
                  <td>
                    <button className="btn-edit" onClick={() => handleEditUser(user)}>Sửa</button>
                    <button className="btn-delete" onClick={() => handleDeleteUser(user.userId)}>Xóa</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Sửa Người Dùng</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form className="modal-form" onSubmit={handleSave}>
              {message && <div className="success-message">{message}</div>}
              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label>Họ và Tên *</label>
                <input 
                  type="text" 
                  name="fullName"
                  placeholder="Họ và tên" 
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input 
                  type="email" 
                  name="email"
                  placeholder="Email" 
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled
                />
              </div>

              <div className="form-group">
                <label>Số Điện Thoại</label>
                <input 
                  type="tel" 
                  name="phoneNumber"
                  placeholder="Số điện thoại" 
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Địa Chỉ</label>
                <textarea 
                  name="address"
                  placeholder="Địa chỉ" 
                  rows="3"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Vai Trò</label>
                <select 
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                >
                  <option value="customer">Khách hàng</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="modal-buttons">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn-save" disabled={loading}>
                  {loading ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers
