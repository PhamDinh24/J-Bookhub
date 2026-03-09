import { useState, useEffect } from 'react'
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal'
import api from '../../services/api'
import { showSuccess, showError } from '../../utils/toastNotifications'

function AdminUsers() {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    role: 'customer',
    accountStatus: 'active'
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const itemsPerPage = 10

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [users, searchTerm, roleFilter, statusFilter])

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users')
      setUsers(response.data)
    } catch (err) {
      console.error('Error fetching users:', err)
      setError('Lỗi tải danh sách người dùng')
    }
  }

  const applyFilters = () => {
    let result = [...users]

    if (searchTerm) {
      result = result.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phoneNumber?.includes(searchTerm)
      )
    }

    if (roleFilter) {
      result = result.filter(user => user.role === roleFilter)
    }

    if (statusFilter) {
      result = result.filter(user => user.accountStatus === statusFilter)
    }

    setFilteredUsers(result)
    setCurrentPage(1)
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value)
  }

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value)
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setRoleFilter('')
    setStatusFilter('')
  }

  const handleEditUser = (user) => {
    setEditingId(user.userId)
    setFormData({
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      address: user.address || '',
      role: user.role || 'customer',
      accountStatus: user.accountStatus || 'active'
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
      const msg = 'Vui lòng điền đầy đủ thông tin bắt buộc'
      setError(msg)
      showError('❌ ' + msg)
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      const msg = 'Email không hợp lệ'
      setError(msg)
      showError('❌ ' + msg)
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
        role: formData.role,
        accountStatus: formData.accountStatus
      }

      await api.put(`/users/${editingId}`, userData)
      showSuccess('✅ Cập nhật người dùng thành công!')
      setMessage('Cập nhật người dùng thành công!')
      setShowModal(false)
      fetchUsers()
      setTimeout(() => setMessage(''), 2000)
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Lỗi cập nhật người dùng. Vui lòng thử lại.'
      setError(errorMsg)
      showError('❌ ' + errorMsg)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLockUnlockUser = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    const confirmMsg = currentStatus === 'active' 
      ? 'Bạn có chắc chắn muốn khóa tài khoản này?' 
      : 'Bạn có chắc chắn muốn mở khóa tài khoản này?'
    
    if (!window.confirm(confirmMsg)) return

    try {
      await api.put(`/users/${userId}`, { accountStatus: newStatus })
      const successMsg = `${newStatus === 'active' ? 'Mở khóa' : 'Khóa'} tài khoản thành công!`
      showSuccess('✅ ' + successMsg)
      setMessage(successMsg)
      fetchUsers()
      setTimeout(() => setMessage(''), 2000)
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Lỗi cập nhật trạng thái tài khoản'
      setError(errorMsg)
      showError('❌ ' + errorMsg)
      console.error(err)
    }
  }

  const handleDeleteUser = (userId) => {
    const user = users.find(u => u.userId === userId)
    setDeleteTarget({ id: userId, title: user?.fullName || 'Người dùng' })
    setShowDeleteConfirm(true)
  }

  const confirmDeleteUser = async () => {
    if (!deleteTarget) return
    try {
      await api.delete(`/users/${deleteTarget.id}`)
      showSuccess('✅ Xóa người dùng thành công!')
      setMessage('Xóa người dùng thành công!')
      setShowDeleteConfirm(false)
      setDeleteTarget(null)
      fetchUsers()
      setTimeout(() => setMessage(''), 2000)
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Lỗi xóa người dùng'
      setError(errorMsg)
      showError('❌ ' + errorMsg)
      console.error(err)
    }
  }

  return (
    <div className="admin-page">
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <h1>Quản Lý Người Dùng</h1>

      <div className="filter-section">
        <div className="filter-row">
          <div className="filter-group search-group">
            <label>Tìm Kiếm</label>
            <input 
              type="text" 
              placeholder="Tìm theo tên, email hoặc số điện thoại..." 
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <button className="btn-secondary" onClick={handleClearFilters}>Xóa</button>
          </div>
          <div className="filter-group">
            <label>Vai Trò</label>
            <select value={roleFilter} onChange={handleRoleFilterChange}>
              <option value="">-- Tất cả --</option>
              <option value="customer">Khách hàng</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Trạng Thái</label>
            <select value={statusFilter} onChange={handleStatusFilterChange}>
              <option value="">-- Tất cả --</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Khóa</option>
              <option value="suspended">Tạm dừng</option>
            </select>
          </div>
        </div>
      </div>

      <div className="results-info">
        <p>Hiển thị {filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).length} / {filteredUsers.length} kết quả</p>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>Email</th>
              <th>Số Điện Thoại</th>
              <th>Vai Trò</th>
              <th>Trạng Thái</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr><td colSpan="7" style={{textAlign: 'center'}}>Không có dữ liệu</td></tr>
            ) : (
              filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(user => (
                <tr key={user.userId}>
                  <td>{user.userId}</td>
                  <td>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>{user.phoneNumber || '-'}</td>
                  <td>
                    <span className={`role-badge role-${user.role}`}>
                      {user.role === 'admin' ? 'Admin' : 'Khách hàng'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-${user.accountStatus}`}>
                      {user.accountStatus === 'active' ? 'Hoạt động' : user.accountStatus === 'inactive' ? 'Khóa' : 'Tạm dừng'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-edit" title="Sửa" onClick={() => handleEditUser(user)}>✏️</button>
                      <button 
                        className={user.accountStatus === 'active' ? 'btn-lock' : 'btn-unlock'} 
                        title={user.accountStatus === 'active' ? 'Khóa' : 'Mở'}
                        onClick={() => handleLockUnlockUser(user.userId, user.accountStatus)}
                      >
                        {user.accountStatus === 'active' ? '🔒' : '🔓'}
                      </button>
                      <button className="btn-delete" title="Xóa" onClick={() => handleDeleteUser(user.userId)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {users.length > 0 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            ← Trước
          </button>
          <span>Trang {currentPage} / {Math.ceil(filteredUsers.length / itemsPerPage)}</span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredUsers.length / itemsPerPage), p + 1))}
            disabled={currentPage === Math.ceil(filteredUsers.length / itemsPerPage)}
          >
            Sau →
          </button>
        </div>
      )}

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
                  required
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

              <div className="form-group">
                <label>Trạng Thái Tài Khoản</label>
                <select 
                  name="accountStatus"
                  value={formData.accountStatus}
                  onChange={handleInputChange}
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Khóa</option>
                  <option value="suspended">Tạm dừng</option>
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

      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        title={deleteTarget?.title}
        message="Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa?"
        onConfirm={confirmDeleteUser}
        onCancel={() => {
          setShowDeleteConfirm(false)
          setDeleteTarget(null)
        }}
        isLoading={false}
      />
    </div>
  )
}

export default AdminUsers
