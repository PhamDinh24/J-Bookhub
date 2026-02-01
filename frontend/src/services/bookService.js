import api from './api'

const bookService = {
  getAllBooks: () => api.get('/books'),
  
  getBookById: (id) => api.get(`/books/${id}`),
  
  createBook: (book) => api.post('/books', book),
  
  updateBook: (id, book) => api.put(`/books/${id}`, book),
  
  deleteBook: (id) => api.delete(`/books/${id}`),
  
  searchBooks: (keyword) => api.get('/books/search', { params: { keyword } }),
  
  getBooksByCategory: (categoryId) => api.get(`/books/category/${categoryId}`),
  
  getBooksByAuthor: (authorId) => api.get(`/books/author/${authorId}`),
}

export default bookService
