package com.bookstore.controller;

import com.bookstore.model.Order;
import com.bookstore.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class OrderController {
    @Autowired
    private OrderService orderService;

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Integer id) {
        return orderService.getOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getOrdersByUserId(@PathVariable Integer userId) {
        return ResponseEntity.ok(orderService.getOrdersByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody Order order) {
        try {
            System.out.println("=== Creating Order ===");
            System.out.println("Order object: " + order);
            System.out.println("Order userId: " + order.getUserId());
            System.out.println("Order totalAmount: " + order.getTotalAmount());
            System.out.println("Order shippingAddress: " + order.getShippingAddress());
            System.out.println("Order status: " + order.getStatus());
            
            if (order.getUserId() == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "userId is required");
                error.put("details", "User ID cannot be null");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Check if user exists
            System.out.println("Checking if user exists with ID: " + order.getUserId());
            
            if (order.getTotalAmount() == null || order.getTotalAmount().compareTo(BigDecimal.ZERO) <= 0) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "totalAmount must be greater than 0");
                error.put("details", "Amount received: " + order.getTotalAmount());
                return ResponseEntity.badRequest().body(error);
            }
            
            if (order.getShippingAddress() == null || order.getShippingAddress().trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "shippingAddress is required");
                return ResponseEntity.badRequest().body(error);
            }
            
            Order createdOrder = orderService.createOrder(order);
            System.out.println("Order created with ID: " + createdOrder.getOrderId());
            return ResponseEntity.status(HttpStatus.CREATED).body(createdOrder);
        } catch (Exception e) {
            System.out.println("Error creating order: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, String> error = new HashMap<>();
            
            // Check if it's a foreign key constraint error
            if (e.getMessage() != null && e.getMessage().contains("foreign key constraint")) {
                error.put("error", "User not found");
                error.put("details", "The user ID " + order.getUserId() + " does not exist in the database");
                error.put("message", "Please log in with a valid user account");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            error.put("error", e.getMessage());
            error.put("type", e.getClass().getSimpleName());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Order> updateOrder(@PathVariable Integer id, @RequestBody Order orderDetails) {
        return ResponseEntity.ok(orderService.updateOrder(id, orderDetails));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Integer id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }
}
