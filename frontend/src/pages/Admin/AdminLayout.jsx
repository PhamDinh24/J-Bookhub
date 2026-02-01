import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminDashboard from './AdminDashboard'
import AdminBooks from './AdminBooks'
import AdminUsers from './AdminUsers'
import AdminOrders from './AdminOrders'
import AdminCategories from './AdminCategories'
import AdminAuthors from './AdminAuthors'
import AdminPublishers from './AdminPublishers'
import AdminPayments from './AdminPayments'
import AdminReviews from './AdminReviews'
import '../../styles/Admin.css'

function AdminLayout() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const navigate = useNavigate()

  const handleLogout = () => {
    navigate('/')
  }

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div className="admin-header-sidebar">
          <h2>Admin Panel</h2>
          <button className="btn-logout" onClick={handleLogout} title="Quay lại trang chủ">
            ← Quay lại
          </button>
        </div>
        <ul className="admin-menu">
          <li>
            <button
              className={`menu-link ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              📊 Bảng Điều Khiển
            </button>
          </li>
          <li>
            <button
              className={`menu-link ${activeTab === 'books' ? 'active' : ''}`}
              onClick={() => setActiveTab('books')}
            >
              📚 Quản Lý Sách
            </button>
          </li>
          <li>
            <button
              className={`menu-link ${activeTab === 'categories' ? 'active' : ''}`}
              onClick={() => setActiveTab('categories')}
            >
              🏷️ Quản Lý Danh Mục
            </button>
          </li>
          <li>
            <button
              className={`menu-link ${activeTab === 'authors' ? 'active' : ''}`}
              onClick={() => setActiveTab('authors')}
            >
              ✍️ Quản Lý Tác Giả
            </button>
          </li>
          <li>
            <button
              className={`menu-link ${activeTab === 'publishers' ? 'active' : ''}`}
              onClick={() => setActiveTab('publishers')}
            >
              🏢 Quản Lý NXB
            </button>
          </li>
          <li>
            <button
              className={`menu-link ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              👥 Quản Lý Người Dùng
            </button>
          </li>
          <li>
            <button
              className={`menu-link ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              📦 Quản Lý Đơn Hàng
            </button>
          </li>
          <li>
            <button
              className={`menu-link ${activeTab === 'payments' ? 'active' : ''}`}
              onClick={() => setActiveTab('payments')}
            >
              💳 Quản Lý Thanh Toán
            </button>
          </li>
          <li>
            <button
              className={`menu-link ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              ⭐ Quản Lý Đánh Giá
            </button>
          </li>
        </ul>
      </aside>

      <main className="admin-content">
        {activeTab === 'dashboard' && <AdminDashboard />}
        {activeTab === 'books' && <AdminBooks />}
        {activeTab === 'categories' && <AdminCategories />}
        {activeTab === 'authors' && <AdminAuthors />}
        {activeTab === 'publishers' && <AdminPublishers />}
        {activeTab === 'users' && <AdminUsers />}
        {activeTab === 'orders' && <AdminOrders />}
        {activeTab === 'payments' && <AdminPayments />}
        {activeTab === 'reviews' && <AdminReviews />}
      </main>
    </div>
  )
}

export default AdminLayout
