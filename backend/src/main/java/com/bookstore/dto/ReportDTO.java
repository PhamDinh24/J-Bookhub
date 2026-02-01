package com.bookstore.dto;

import java.math.BigDecimal;
import java.util.List;

public class ReportDTO {
    private BigDecimal totalRevenue;
    private Integer totalOrders;
    private Integer totalUsers;
    private Integer totalBooks;
    private Integer completedOrders;
    private Integer pendingOrders;
    private Integer shippedOrders;
    private List<DailyRevenueDTO> dailyRevenue;
    private List<DailyOrderDTO> dailyOrders;
    private List<CategorySalesDTO> topCategories;

    public ReportDTO() {}

    public ReportDTO(BigDecimal totalRevenue, Integer totalOrders, Integer totalUsers, Integer totalBooks,
                     Integer completedOrders, Integer pendingOrders, Integer shippedOrders,
                     List<DailyRevenueDTO> dailyRevenue, List<DailyOrderDTO> dailyOrders,
                     List<CategorySalesDTO> topCategories) {
        this.totalRevenue = totalRevenue;
        this.totalOrders = totalOrders;
        this.totalUsers = totalUsers;
        this.totalBooks = totalBooks;
        this.completedOrders = completedOrders;
        this.pendingOrders = pendingOrders;
        this.shippedOrders = shippedOrders;
        this.dailyRevenue = dailyRevenue;
        this.dailyOrders = dailyOrders;
        this.topCategories = topCategories;
    }

    // Getters and Setters
    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }

    public Integer getTotalOrders() { return totalOrders; }
    public void setTotalOrders(Integer totalOrders) { this.totalOrders = totalOrders; }

    public Integer getTotalUsers() { return totalUsers; }
    public void setTotalUsers(Integer totalUsers) { this.totalUsers = totalUsers; }

    public Integer getTotalBooks() { return totalBooks; }
    public void setTotalBooks(Integer totalBooks) { this.totalBooks = totalBooks; }

    public Integer getCompletedOrders() { return completedOrders; }
    public void setCompletedOrders(Integer completedOrders) { this.completedOrders = completedOrders; }

    public Integer getPendingOrders() { return pendingOrders; }
    public void setPendingOrders(Integer pendingOrders) { this.pendingOrders = pendingOrders; }

    public Integer getShippedOrders() { return shippedOrders; }
    public void setShippedOrders(Integer shippedOrders) { this.shippedOrders = shippedOrders; }

    public List<DailyRevenueDTO> getDailyRevenue() { return dailyRevenue; }
    public void setDailyRevenue(List<DailyRevenueDTO> dailyRevenue) { this.dailyRevenue = dailyRevenue; }

    public List<DailyOrderDTO> getDailyOrders() { return dailyOrders; }
    public void setDailyOrders(List<DailyOrderDTO> dailyOrders) { this.dailyOrders = dailyOrders; }

    public List<CategorySalesDTO> getTopCategories() { return topCategories; }
    public void setTopCategories(List<CategorySalesDTO> topCategories) { this.topCategories = topCategories; }

    // Inner DTOs
    public static class DailyRevenueDTO {
        private String date;
        private BigDecimal revenue;

        public DailyRevenueDTO() {}
        public DailyRevenueDTO(String date, BigDecimal revenue) {
            this.date = date;
            this.revenue = revenue;
        }

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        public BigDecimal getRevenue() { return revenue; }
        public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }
    }

    public static class DailyOrderDTO {
        private String date;
        private Integer count;

        public DailyOrderDTO() {}
        public DailyOrderDTO(String date, Integer count) {
            this.date = date;
            this.count = count;
        }

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        public Integer getCount() { return count; }
        public void setCount(Integer count) { this.count = count; }
    }

    public static class CategorySalesDTO {
        private String name;
        private Integer count;

        public CategorySalesDTO() {}
        public CategorySalesDTO(String name, Integer count) {
            this.name = name;
            this.count = count;
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public Integer getCount() { return count; }
        public void setCount(Integer count) { this.count = count; }
    }
}
