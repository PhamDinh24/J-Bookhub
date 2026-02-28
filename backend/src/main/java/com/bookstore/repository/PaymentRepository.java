package com.bookstore.repository;

import com.bookstore.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    Optional<Payment> findByOrderId(Integer orderId);
    
    /**
     * Task 2.1.5: Find payment by transaction ID to prevent duplicates
     */
    Optional<Payment> findByTransactionId(String transactionId);
    
    /**
     * Task 2.2.1 & 2.2.2: Filter payments by method
     */
    List<Payment> findByPaymentMethod(String paymentMethod);
    
    /**
     * Task 2.2.3: Filter payments by status
     */
    List<Payment> findByStatus(String status);
    
    /**
     * Task 2.2.1: Get all payments with filters
     */
    @Query("SELECT p FROM Payment p WHERE " +
           "(:method IS NULL OR p.paymentMethod = :method) AND " +
           "(:status IS NULL OR p.status = :status)")
    List<Payment> findByFilters(@Param("method") String method, @Param("status") String status);
}
