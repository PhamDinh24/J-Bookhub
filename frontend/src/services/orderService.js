import api from './api'

const orderService = {
  getAllOrders: () => api.get('/orders'),
  
  getOrderById: (id) => api.get(`/orders/${id}`),
  
  getOrdersByUserId: (userId) => api.get(`/orders/user/${userId}`),
  
  createOrder: (order) => api.post('/orders', order),
  
  updateOrder: (id, order) => api.put(`/orders/${id}`, order),
  
  deleteOrder: (id) => api.delete(`/orders/${id}`),
}

export default orderService
