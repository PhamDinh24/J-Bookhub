import api from './api'

const userService = {
  getAllUsers: () => api.get('/users'),
  
  getUserById: (id) => api.get(`/users/${id}`),
  
  getUserByEmail: (email) => api.get(`/users/email/${email}`),
  
  createUser: (user) => api.post('/users', user),
  
  updateUser: (id, user) => api.put(`/users/${id}`, user),
  
  deleteUser: (id) => api.delete(`/users/${id}`),
}

export default userService
