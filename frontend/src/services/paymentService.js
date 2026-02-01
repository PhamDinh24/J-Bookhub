import api from './api'

const paymentService = {
  createVNPayUrl: (orderId, amount, orderInfo, returnUrl) => 
    api.post('/payments/create-vnpay-url', {
      orderId,
      amount,
      orderInfo,
      returnUrl
    }),
  
  getPaymentById: (id) => api.get(`/payments/${id}`),
  
  getPaymentByOrderId: (orderId) => api.get(`/payments/order/${orderId}`),
  
  createPayment: (payment) => api.post('/payments', payment),
}

export default paymentService
