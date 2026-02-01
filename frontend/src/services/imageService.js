import api from './api'

const imageService = {
  /**
   * Upload book cover image
   * @param {File} file - Image file to upload
   * @returns {Promise} - Response with image URL
   */
  uploadBookCover: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const response = await api.post('/images/upload/book-cover', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      console.error('Error uploading book cover:', error)
      throw error
    }
  },

  /**
   * Upload user avatar
   * @param {File} file - Image file to upload
   * @returns {Promise} - Response with image URL
   */
  uploadAvatar: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const response = await api.post('/images/upload/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      console.error('Error uploading avatar:', error)
      throw error
    }
  },

  /**
   * Upload generic image
   * @param {File} file - Image file to upload
   * @param {string} folder - Folder name in Cloudinary
   * @returns {Promise} - Response with image URL
   */
  uploadImage: async (file, folder = 'general') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)
    
    try {
      const response = await api.post('/images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  },

  /**
   * Check if image service is available
   * @returns {Promise} - Health check response
   */
  checkHealth: async () => {
    try {
      const response = await api.get('/images/health')
      return response.data
    } catch (error) {
      console.error('Error checking image service health:', error)
      throw error
    }
  }
}

export default imageService
