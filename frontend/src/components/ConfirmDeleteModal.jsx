import '../styles/Admin.css'

function ConfirmDeleteModal({ isOpen, title, message, onConfirm, onCancel, isLoading }) {
  return (
    <div className={`confirm-modal ${isOpen ? 'active' : ''}`}>
      <div className="confirm-modal-content">
        <div className="confirm-modal-header">
          <h2>⚠️ Xác Nhận Xóa</h2>
        </div>
        <div className="confirm-modal-message">
          <p><strong>{title}</strong></p>
          <p>{message}</p>
        </div>
        <div className="confirm-modal-buttons">
          <button 
            className="btn-confirm-cancel"
            onClick={onCancel}
            disabled={isLoading}
          >
            Hủy
          </button>
          <button 
            className="btn-confirm-delete"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Đang xóa...' : 'Xóa'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDeleteModal
