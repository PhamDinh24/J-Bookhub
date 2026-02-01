package com.bookstore.util;

public class Constants {
    // User Roles
    public static final String ROLE_ADMIN = "admin";
    public static final String ROLE_CUSTOMER = "customer";

    // Order Status
    public static final String ORDER_STATUS_PENDING = "pending";
    public static final String ORDER_STATUS_CONFIRMED = "confirmed";
    public static final String ORDER_STATUS_SHIPPED = "shipped";
    public static final String ORDER_STATUS_DELIVERED = "delivered";
    public static final String ORDER_STATUS_CANCELLED = "cancelled";

    // Payment Status
    public static final String PAYMENT_STATUS_PENDING = "pending";
    public static final String PAYMENT_STATUS_COMPLETED = "completed";
    public static final String PAYMENT_STATUS_FAILED = "failed";
    public static final String PAYMENT_STATUS_REFUNDED = "refunded";

    // Payment Methods
    public static final String PAYMENT_METHOD_VNPAY = "vnpay";
    public static final String PAYMENT_METHOD_CREDIT_CARD = "credit_card";
    public static final String PAYMENT_METHOD_BANK_TRANSFER = "bank_transfer";

    // Validation
    public static final int MIN_PASSWORD_LENGTH = 6;
    public static final int MAX_PASSWORD_LENGTH = 100;
    public static final int MAX_BOOK_TITLE_LENGTH = 255;
    public static final int MAX_DESCRIPTION_LENGTH = 5000;

    // Pagination
    public static final int DEFAULT_PAGE_SIZE = 20;
    public static final int MAX_PAGE_SIZE = 100;

    // File Upload
    public static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    public static final String[] ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"};
}
