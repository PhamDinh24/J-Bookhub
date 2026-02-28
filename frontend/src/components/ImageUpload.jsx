import { useState } from 'react'
import imageService from '../services/imageService'
import './ImageUpload.css'

function ImageUpload({ onImageUpload, folder = 'general', type = 'general', bookId = null }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(null)
  const [fileName, setFileName] = useState('')

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn một tệp hình ảnh')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Kích thước tệp không được vượt quá 10MB')
      return
    }

    setError('')
    setFileName(file.name)

    // Show preview
    const reader = new FileReader()
    reader.onload = (event) => {
      setPreview(event.target.result)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    const fileInput = document.getElementById('image-input')
    const file = fileInput.files[0]

    if (!file) {
      setError('Vui lòng chọn một tệp hình ảnh')
      return
    }

    setLoading(true)
    setError('')

    try {
      let response
      if (type === 'book-cover') {
        response = await imageService.uploadBookCover(file, bookId)
      } else if (type === 'avatar') {
        response = await imageService.uploadAvatar(file)
      } else {
        response = await imageService.uploadImage(file, folder)
      }

      // Call callback with image URL
      if (onImageUpload) {
        onImageUpload(response.url)
      }

      // Reset form
      setPreview(null)
      setFileName('')
      fileInput.value = ''
    } catch (err) {
      // Provide more detailed error message
      let errorMessage = 'Lỗi tải lên hình ảnh. Vui lòng thử lại.'
      
      if (err.response?.status === 500) {
        errorMessage = 'Lỗi máy chủ. Vui lòng kiểm tra cấu hình Cloudinary.'
      } else if (err.response?.status === 400) {
        errorMessage = 'Tệp không hợp lệ. Vui lòng chọn hình ảnh khác.'
      } else if (err.message === 'Network Error') {
        errorMessage = 'Lỗi kết nối. Vui lòng kiểm tra backend đang chạy.'
      }
      
      setError(errorMessage)
      console.error('Image upload error:', err)
      console.error('Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="image-upload">
      <div className="upload-area">
        <input
          id="image-input"
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={loading}
          className="file-input"
        />
        <label htmlFor="image-input" className="upload-label">
          <div className="upload-icon">📸</div>
          <p>Chọn hình ảnh hoặc kéo thả</p>
          <small>Hỗ trợ: JPG, PNG, GIF (Tối đa 10MB)</small>
        </label>
      </div>

      {preview && (
        <div className="preview-section">
          <img src={preview} alt="Preview" className="preview-image" />
          <p className="file-name">{fileName}</p>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {preview && (
        <button
          onClick={handleUpload}
          disabled={loading}
          className="btn btn-primary upload-btn"
        >
          {loading ? 'Đang tải lên...' : 'Tải Lên'}
        </button>
      )}
    </div>
  )
}

export default ImageUpload
