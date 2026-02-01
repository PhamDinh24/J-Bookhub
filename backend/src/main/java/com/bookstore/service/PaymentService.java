package com.bookstore.service;

import com.bookstore.model.Payment;
import com.bookstore.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class PaymentService {
    @Autowired
    private PaymentRepository paymentRepository;

    public Payment createPayment(Payment payment) {
        return paymentRepository.save(payment);
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public Optional<Payment> getPaymentById(Integer id) {
        return paymentRepository.findById(id);
    }

    public Optional<Payment> getPaymentByOrderId(Integer orderId) {
        return paymentRepository.findByOrderId(orderId);
    }

    public Payment updatePayment(Integer id, Payment paymentDetails) {
        return paymentRepository.findById(id).map(payment -> {
            payment.setStatus(paymentDetails.getStatus());
            payment.setTransactionId(paymentDetails.getTransactionId());
            return paymentRepository.save(payment);
        }).orElseThrow(() -> new RuntimeException("Payment not found"));
    }

    public void deletePayment(Integer id) {
        paymentRepository.deleteById(id);
    }
}
