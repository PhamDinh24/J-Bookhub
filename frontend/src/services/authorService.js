import api from './api'

const authorService = {
  getAllAuthors: () => api.get('/authors'),
  
  getAuthorById: (id) => api.get(`/authors/${id}`),
  
  createAuthor: (author) => api.post('/authors', author),
  
  updateAuthor: (id, author) => api.put(`/authors/${id}`, author),
  
  deleteAuthor: (id) => api.delete(`/authors/${id}`),
}

export default authorService
