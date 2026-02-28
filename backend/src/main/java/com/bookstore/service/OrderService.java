package com.bookstore.service;

import com.bookstore.model.Order;
import com.bookstore.model.OrderDetail;
import com.bookstore.model.Book;
import com.bookstore.repository.OrderRepository;
import com.bookstore.repository.OrderDetailRepository;
import com.bookstore.repository.BookRepository;
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
            if (orderDetails.getStatus() != null) {
                order.setStatus(orderDetails.getStatus());
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
