package com.bookstore.service;

import com.bookstore.dto.ReportDTO;
import com.bookstore.dto.ReportDTO.DailyRevenueDTO;
import com.bookstore.dto.ReportDTO.DailyOrderDTO;
import com.bookstore.dto.ReportDTO.CategorySalesDTO;
import com.bookstore.model.Order;
import com.bookstore.model.OrderDetail;
import com.bookstore.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {
    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderDetailRepository orderDetailRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    public ReportDTO generateReport(LocalDate startDate, LocalDate endDate) {
        ReportDTO report = new ReportDTO();

        // Convert LocalDate to LocalDateTime for comparison
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);

        // Get all orders in date range
        List<Order> orders = orderRepository.findAll().stream()
                .filter(o -> !o.getOrderDate().isBefore(startDateTime) && !o.getOrderDate().isAfter(endDateTime))
                .collect(Collectors.toList());

        // Calculate totals
        report.setTotalOrders(orders.size());
        report.setTotalRevenue(orders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add));

        report.setTotalUsers((int) userRepository.count());
        report.setTotalBooks((int) bookRepository.count());

        // Order status breakdown
        report.setCompletedOrders((int) orders.stream().filter(o -> "completed".equals(o.getStatus())).count());
        report.setPendingOrders((int) orders.stream().filter(o -> "pending".equals(o.getStatus())).count());
        report.setShippedOrders((int) orders.stream().filter(o -> "shipped".equals(o.getStatus())).count());

        // Daily revenue
        report.setDailyRevenue(calculateDailyRevenue(orders, startDate, endDate));

        // Daily orders
        report.setDailyOrders(calculateDailyOrders(orders, startDate, endDate));

        // Top categories
        report.setTopCategories(calculateTopCategories(orders));

        return report;
    }

    private List<DailyRevenueDTO> calculateDailyRevenue(List<Order> orders, LocalDate startDate, LocalDate endDate) {
        Map<LocalDate, BigDecimal> dailyMap = new TreeMap<>();

        // Initialize all dates with 0
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            dailyMap.put(date, BigDecimal.ZERO);
        }

        // Aggregate revenue by date
        for (Order order : orders) {
            LocalDate orderDate = order.getOrderDate().toLocalDate();
            if (!orderDate.isBefore(startDate) && !orderDate.isAfter(endDate)) {
                dailyMap.put(orderDate, dailyMap.get(orderDate).add(order.getTotalAmount()));
            }
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        return dailyMap.entrySet().stream()
                .map(e -> new DailyRevenueDTO(e.getKey().format(formatter), e.getValue()))
                .collect(Collectors.toList());
    }

    private List<DailyOrderDTO> calculateDailyOrders(List<Order> orders, LocalDate startDate, LocalDate endDate) {
        Map<LocalDate, Integer> dailyMap = new TreeMap<>();

        // Initialize all dates with 0
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            dailyMap.put(date, 0);
        }

        // Count orders by date
        for (Order order : orders) {
            LocalDate orderDate = order.getOrderDate().toLocalDate();
            if (!orderDate.isBefore(startDate) && !orderDate.isAfter(endDate)) {
                dailyMap.put(orderDate, dailyMap.get(orderDate) + 1);
            }
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        return dailyMap.entrySet().stream()
                .map(e -> new DailyOrderDTO(e.getKey().format(formatter), e.getValue()))
                .collect(Collectors.toList());
    }

    private List<CategorySalesDTO> calculateTopCategories(List<Order> orders) {
        Map<String, Integer> categoryMap = new HashMap<>();

        for (Order order : orders) {
            List<OrderDetail> details = orderDetailRepository.findAll().stream()
                    .filter(od -> od.getOrderId().equals(order.getOrderId()))
                    .collect(Collectors.toList());

            for (OrderDetail detail : details) {
                if (detail.getBook() != null && detail.getBook().getCategory() != null) {
                    String categoryName = detail.getBook().getCategory().getName();
                    categoryMap.put(categoryName, categoryMap.getOrDefault(categoryName, 0) + detail.getQuantity());
                }
            }
        }

        return categoryMap.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .limit(5)
                .map(e -> new CategorySalesDTO(e.getKey(), e.getValue()))
                .collect(Collectors.toList());
    }
}
