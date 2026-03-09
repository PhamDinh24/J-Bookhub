package com.bookstore.service;

import com.bookstore.model.Order;
import com.bookstore.model.OrderDetail;
import com.bookstore.model.Book;
import com.bookstore.model.Payment;
import com.bookstore.repository.OrderRepository;
import com.bookstore.repository.OrderDetailRepository;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class OrderService {
    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderDetailRepository orderDetailRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Optional<Order> getOrderById(Integer id) {
        return orderRepository.findById(id);
    }

    public List<Order> getOrdersByUserId(Integer userId) {
        return orderRepository.findByUserId(userId);
    }

    public Order createOrder(Order order) {
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());
        if (order.getStatus() == null) {
            order.setStatus("pending");
        }
        return orderRepository.save(order);
    }

    public Order updateOrder(Integer id, Order orderDetails) {
        return orderRepository.findById(id).map(order -> {
            String oldStatus = order.getStatus();
            String newStatus = orderDetails.getStatus();
            
            if (newStatus != null) {
                order.setStatus(newStatus);
                
                // Update stock when order is delivered
                if ("delivered".equalsIgnoreCase(newStatus) && 
                    !"delivered".equalsIgnoreCase(oldStatus)) {
                    try {
                        updateStockForDeliveredOrder(id);
                    } catch (Exception e) {
                        // Revert status if stock update fails
                        order.setStatus(oldStatus);
                        throw new RuntimeException("Failed to update stock: " + e.getMessage());
                    }
                }
                
                // Restore stock when order is cancelled
                if ("cancelled".equalsIgnoreCase(newStatus) && 
                    !"cancelled".equalsIgnoreCase(oldStatus) &&
                    "delivered".equalsIgnoreCase(oldStatus)) {
                    restoreStockForCancelledOrder(id);
                }
            }
            
            if (orderDetails.getTotalAmount() != null) {
                order.setTotalAmount(orderDetails.getTotalAmount());
            }
            if (orderDetails.getShippingAddress() != null) {
                order.setShippingAddress(orderDetails.getShippingAddress());
            }
            order.setUpdatedAt(LocalDateTime.now());
            return orderRepository.save(order);
        }).orElseThrow(() -> new RuntimeException("Order not found"));
    }

    private void updateStockForDeliveredOrder(Integer orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        List<OrderDetail> orderDetails = orderDetailRepository.findByOrderId(orderId);
        
        if (orderDetails == null || orderDetails.isEmpty()) {
            throw new RuntimeException("No order details found for order: " + orderId);
        }
        
        for (OrderDetail detail : orderDetails) {
            Optional<Book> bookOpt = bookRepository.findById(detail.getBookId());
            if (bookOpt.isPresent()) {
                Book book = bookOpt.get();
                int newStock = book.getStockQuantity() - detail.getQuantity();
                
                // Ensure stock doesn't go below 0
                if (newStock < 0) {
                    throw new RuntimeException("Insufficient stock for book: " + book.getTitle());
                }
                
                book.setStockQuantity(newStock);
                bookRepository.save(book);
            } else {
                throw new RuntimeException("Book not found: " + detail.getBookId());
            }
        }
        
        // Set delivered timestamp
        order.setDeliveredAt(LocalDateTime.now());
        orderRepository.save(order);
        
        // Update payment status to completed
        Optional<Payment> payment = paymentRepository.findByOrderId(orderId);
        if (payment.isPresent()) {
            Payment p = payment.get();
            p.setStatus("completed");
            paymentRepository.save(p);
        }
    }

    private void restoreStockForCancelledOrder(Integer orderId) {
        List<OrderDetail> orderDetails = orderDetailRepository.findByOrderId(orderId);
        
        for (OrderDetail detail : orderDetails) {
            Optional<Book> bookOpt = bookRepository.findById(detail.getBookId());
            if (bookOpt.isPresent()) {
                Book book = bookOpt.get();
                book.setStockQuantity(book.getStockQuantity() + detail.getQuantity());
                bookRepository.save(book);
            }
        }
    }

    public void deleteOrder(Integer id) {
        orderRepository.deleteById(id);
    }

    public Map<String, Object> getOrderDetails(Integer orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        // Get order details (items)
        List<OrderDetail> orderDetails = orderDetailRepository.findByOrderId(orderId);
        
        // Convert to map with book information
        List<Map<String, Object>> items = orderDetails.stream().map(detail -> {
            Map<String, Object> item = new HashMap<>();
            item.put("detailId", detail.getDetailId());
            item.put("bookId", detail.getBookId());
            item.put("quantity", detail.getQuantity());
            item.put("price", detail.getUnitPrice());
            
            // Get book title
            Optional<Book> book = bookRepository.findById(detail.getBookId());
            if (book.isPresent()) {
                item.put("bookTitle", book.get().getTitle());
            } else {
                item.put("bookTitle", "Sách không tồn tại");
            }
            
            return item;
        }).collect(Collectors.toList());
        
        Map<String, Object> details = new HashMap<>();
        details.put("orderId", order.getOrderId());
        details.put("userId", order.getUserId());
        details.put("orderDate", order.getOrderDate());
        details.put("status", order.getStatus());
        details.put("totalAmount", order.getTotalAmount());
        details.put("shippingAddress", order.getShippingAddress());
        details.put("createdAt", order.getCreatedAt());
        details.put("updatedAt", order.getUpdatedAt());
        details.put("items", items);
        
        return details;
    }

    public List<Map<String, Object>> getOrderHistory(Integer orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        List<Map<String, Object>> history = new java.util.ArrayList<>();
        
        Map<String, Object> entry = new HashMap<>();
        entry.put("status", order.getStatus());
        entry.put("timestamp", order.getUpdatedAt());
        entry.put("description", "Order status: " + order.getStatus());
        history.add(entry);
        
        return history;
    }

    public Order cancelOrder(Integer orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        if ("delivered".equalsIgnoreCase(order.getStatus()) || 
            "cancelled".equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException("Cannot cancel order with status: " + order.getStatus());
        }
        
        order.setStatus("cancelled");
        order.setUpdatedAt(LocalDateTime.now());
        return orderRepository.save(order);
    }
}
