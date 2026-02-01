package com.bookstore.controller;

import com.bookstore.dto.ReportDTO;
import com.bookstore.repository.*;
import com.bookstore.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AdminController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private BookRepository bookRepository;
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ReportService reportService;

    @GetMapping("/dashboard/statistics")
    public ResponseEntity<Map<String, Object>> getDashboardStatistics() {
        try {
            Map<String, Object> stats = new HashMap<>();
            
            // User statistics
            long totalUsers = userRepository.count();
            long adminCount = userRepository.findAll().stream()
                .filter(u -> "admin".equals(u.getRole()))
                .count();
            long customerCount = totalUsers - adminCount;
            
            // Book statistics
            long totalBooks = bookRepository.count();
            
            // Order statistics
            long totalOrders = orderRepository.count();
            long pendingOrders = orderRepository.findAll().stream()
                .filter(o -> "pending".equals(o.getStatus()))
                .count();
            long completedOrders = orderRepository.findAll().stream()
                .filter(o -> "completed".equals(o.getStatus()))
                .count();
            
            // Revenue statistics
            double totalRevenue = orderRepository.findAll().stream()
                .mapToDouble(o -> o.getTotalAmount().doubleValue())
                .sum();
            
            // Payment statistics
            long completedPayments = paymentRepository.findAll().stream()
                .filter(p -> "completed".equals(p.getStatus()))
                .count();
            
            // Review statistics
            long totalReviews = reviewRepository.count();
            double averageRating = reviewRepository.findAll().stream()
                .mapToDouble(r -> r.getRating())
                .average()
                .orElse(0.0);
            
            stats.put("users", Map.of(
                "total", totalUsers,
                "admins", adminCount,
                "customers", customerCount
            ));
            
            stats.put("books", Map.of(
                "total", totalBooks
            ));
            
            stats.put("orders", Map.of(
                "total", totalOrders,
                "pending", pendingOrders,
                "completed", completedOrders
            ));
            
            stats.put("revenue", Map.of(
                "total", totalRevenue,
                "currency", "VND"
            ));
            
            stats.put("payments", Map.of(
                "completed", completedPayments
            ));
            
            stats.put("reviews", Map.of(
                "total", totalReviews,
                "averageRating", Math.round(averageRating * 100.0) / 100.0
            ));
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping("/dashboard/recent-orders")
    public ResponseEntity<?> getRecentOrders() {
        try {
            return ResponseEntity.ok(orderRepository.findAll().stream()
                .sorted((a, b) -> b.getOrderDate().compareTo(a.getOrderDate()))
                .limit(10)
                .toList());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/dashboard/top-books")
    public ResponseEntity<?> getTopBooks() {
        try {
            return ResponseEntity.ok(bookRepository.findAll().stream()
                .sorted((a, b) -> Integer.compare(b.getStockQuantity(), a.getStockQuantity()))
                .limit(5)
                .toList());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/reports")
    public ResponseEntity<?> getReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            ReportDTO report = reportService.generateReport(startDate, endDate);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
