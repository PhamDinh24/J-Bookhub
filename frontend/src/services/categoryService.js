import api from './api'

const categoryService = {
  getAllCategories: () => api.get('/categories'),
  
  getCategoryById: (id) => api.get(`/categories/${id}`),
  
  createCategory: (category) => api.post('/categories', category),
  
  updateCategory: (id, category) => api.put(`/categories/${id}`, category),
  
  deleteCategory: (id) => api.delete(`/categories/${id}`),
}

export default categoryService
