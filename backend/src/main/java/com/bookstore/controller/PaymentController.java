package com.bookstore.controller;

import com.bookstore.model.Payment;
import com.bookstore.service.PaymentService;
import com.bookstore.service.VNPayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class PaymentController {
    private static final Logger logger = Logger.getLogger(PaymentController.class.getName());

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private VNPayService vnPayService;

    @PostMapping("/create-vnpay-url")
    public ResponseEntity<Map<String, Object>> createVNPayUrl(
            @RequestParam Long orderId,
            @RequestParam Long amount,
            @RequestParam String orderInfo,
            @RequestParam String returnUrl) throws UnsupportedEncodingException {
        
        try {
            logger.info("Creating VNPay URL - OrderId: " + orderId + ", Amount: " + amount);
            String paymentUrl = vnPayService.createPaymentUrl(orderId, amount, orderInfo, returnUrl);
            
            Map<String, Object> response = new HashMap<>();
            response.put("paymentUrl", paymentUrl);
            response.put("success", true);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.severe("Error creating VNPay URL: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/vnpay-return")
    public ResponseEntity<Map<String, Object>> vnpayReturn(@RequestParam Map<String, String> params) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            logger.info("VNPay return callback received");
            
            if (vnPayService.validatePaymentResponse(params)) {
                String responseCode = params.get("vnp_ResponseCode");
                logger.info("VNPay response code: " + responseCode);
                
                if ("00".equals(responseCode)) {
                    String orderId = params.get("vnp_TxnRef");
                    String transactionId = params.get("vnp_TransactionNo");
                    String amount = params.get("vnp_Amount");
                    
                    logger.info("Payment successful - OrderId: " + orderId + ", TransactionId: " + transactionId);
                    
                    Payment payment = new Payment();
                    payment.setOrderId(Integer.parseInt(orderId));
                    payment.setTransactionId(transactionId);
                    payment.setPaymentMethod("VNPay");
                    payment.setStatus("completed");
                    
                    paymentService.createPayment(payment);
                    
                    response.put("success", true);
                    response.put("message", "Thanh toán thành công");
                    response.put("orderId", orderId);
                    response.put("transactionId", transactionId);
                    return ResponseEntity.ok(response);
                } else {
                    logger.warning("Payment failed with response code: " + responseCode);
                    response.put("success", false);
                    response.put("message", "Thanh toán thất bại - Mã lỗi: " + responseCode);
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                }
            } else {
                logger.warning("Payment validation failed - Invalid secure hash");
                response.put("success", false);
                response.put("message", "Xác thực thanh toán thất bại");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        } catch (Exception e) {
            logger.severe("Error processing VNPay return: " + e.getMessage());
            e.printStackTrace();
            
            response.put("success", false);
            response.put("message", "Lỗi xử lý thanh toán: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping
    public ResponseEntity<Payment> createPayment(@RequestBody Payment payment) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.createPayment(payment));
    }

    @GetMapping
    public ResponseEntity<?> getAllPayments() {
        try {
            return ResponseEntity.ok(paymentService.getAllPayments());
        } catch (Exception e) {
            logger.severe("Error fetching payments: " + e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Payment> getPaymentById(@PathVariable Integer id) {
        return paymentService.getPaymentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<Payment> getPaymentByOrderId(@PathVariable Integer orderId) {
        return paymentService.getPaymentByOrderId(orderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
