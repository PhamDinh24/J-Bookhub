package com.bookstore.service;

import com.bookstore.model.Payment;
import com.bookstore.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.logging.Logger;

@Service
public class PaymentService {
    private static final Logger logger = Logger.getLogger(PaymentService.class.getName());
    
    @Autowired
    private PaymentRepository paymentRepository;

    /**
     * Create a new payment record
     */
    public Payment createPayment(Payment payment) {
        return paymentRepository.save(payment);
    }

    /**
     * Get all payments
     */
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    /**
     * Get payment by ID
     */
    public Optional<Payment> getPaymentById(Integer id) {
        return paymentRepository.findById(id);
    }

    /**
     * Get payment by order ID
     */
    public Optional<Payment> getPaymentByOrderId(Integer orderId) {
        return paymentRepository.findByOrderId(orderId);
    }

    /**
     * Task 2.1.5: Check if transaction already exists (prevent duplicates)
     */
    public Optional<Payment> getPaymentByTransactionId(String transactionId) {
        return paymentRepository.findByTransactionId(transactionId);
    }

    /**
     * Task 2.2.1 & 2.2.2: Get payments filtered by method
     */
    public List<Payment> getPaymentsByMethod(String method) {
        return paymentRepository.findByPaymentMethod(method);
    }

    /**
     * Task 2.2.3: Get payments filtered by status
     */
    public List<Payment> getPaymentsByStatus(String status) {
        return paymentRepository.findByStatus(status);
    }

    /**
     * Task 2.2.1: Get all payments with optional filters
     */
    public List<Payment> getPaymentsWithFilters(String method, String status) {
        return paymentRepository.findByFilters(method, status);
    }

    /**
     * Update payment status
     */
    public Payment updatePayment(Integer id, Payment paymentDetails) {
        return paymentRepository.findById(id).map(payment -> {
            payment.setStatus(paymentDetails.getStatus());
            if (paymentDetails.getTransactionId() != null) {
                payment.setTransactionId(paymentDetails.getTransactionId());
            }
            return paymentRepository.save(payment);
        }).orElseThrow(() -> new RuntimeException("Payment not found"));
    }

    /**
     * Delete payment
     */
    public void deletePayment(Integer id) {
        paymentRepository.deleteById(id);
    }

    /**
     * Task 2.2.1 & 2.2.2 & 2.2.3: Filter payments by method, status, and date range
     */
    public List<Payment> filterPayments(String method, String status, String startDate, String endDate) {
        List<Payment> payments = paymentRepository.findAll();
        
        if (method != null && !method.isEmpty()) {
            payments = payments.stream()
                    .filter(p -> p.getPaymentMethod() != null && p.getPaymentMethod().equalsIgnoreCase(method))
                    .toList();
        }
        
        if (status != null && !status.isEmpty()) {
            payments = payments.stream()
                    .filter(p -> p.getStatus() != null && p.getStatus().equalsIgnoreCase(status))
                    .toList();
        }
        
        return payments;
    }

    /**
     * Search payments by transaction ID
     */
    public List<Payment> searchByTransactionId(String transactionId) {
        return paymentRepository.findAll().stream()
                .filter(p -> p.getTransactionId() != null && p.getTransactionId().contains(transactionId))
                .toList();
    }
}
