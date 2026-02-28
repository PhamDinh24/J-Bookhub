package com.bookstore.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.logging.Logger;

@Service
public class VNPayService {
    private static final Logger logger = Logger.getLogger(VNPayService.class.getName());
    private static final String HMAC_SHA512 = "HmacSHA512";

    @Value("${vnpay.tmnCode}")
    private String tmnCode;

    @Value("${vnpay.hashSecret}")
    private String hashSecret;

    @Value("${vnpay.apiUrl}")
    private String apiUrl;

    /**
     * Task 2.1.1: Create VNPay request with HMAC SHA512 signature
     * Generates a secure payment URL with proper HMAC SHA512 signature
     */
    public String createPaymentUrl(Long orderId, Long amount, String orderInfo, String returnUrl) {
        try {
            logger.info("Creating VNPay payment URL for order: " + orderId + ", amount: " + amount);
            
            Map<String, String> vnpParams = new TreeMap<>();
            vnpParams.put("vnp_Version", "2.1.0");
            vnpParams.put("vnp_Command", "pay");
            vnpParams.put("vnp_TmnCode", tmnCode);
            vnpParams.put("vnp_Amount", String.valueOf(amount * 100)); // VNPay expects amount in cents
            vnpParams.put("vnp_CurrCode", "VND");
            vnpParams.put("vnp_TxnRef", String.valueOf(orderId));
            vnpParams.put("vnp_OrderInfo", orderInfo);
            vnpParams.put("vnp_OrderType", "other");
            vnpParams.put("vnp_Locale", "vn");
            vnpParams.put("vnp_ReturnUrl", returnUrl);
            vnpParams.put("vnp_CreateDate", new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()));
            vnpParams.put("vnp_IpAddr", "127.0.0.1");

            String queryUrl = buildQueryString(vnpParams);
            String vnpSecureHash = generateHmacSHA512(queryUrl);
            String paymentUrl = apiUrl + "?" + queryUrl + "&vnp_SecureHash=" + vnpSecureHash;
            
            logger.info("Payment URL created successfully for order: " + orderId);
            return paymentUrl;
        } catch (Exception e) {
            logger.severe("Error creating payment URL: " + e.getMessage());
            throw new RuntimeException("Failed to create payment URL", e);
        }
    }

    /**
     * Task 2.1.4: Verify VNPay signature
     * Validates the signature from VNPay callback response
     */
    public boolean validatePaymentResponse(Map<String, String> params) {
        try {
            String vnpSecureHash = params.get("vnp_SecureHash");
            if (vnpSecureHash == null || vnpSecureHash.isEmpty()) {
                logger.warning("Missing vnp_SecureHash in response");
                return false;
            }
            
            params.remove("vnp_SecureHash");
            params.remove("vnp_SecureHashType");

            String queryUrl = buildQueryString(params);
            String calculatedHash = generateHmacSHA512(queryUrl);
            
            boolean isValid = vnpSecureHash.equals(calculatedHash);
            logger.info("Payment validation result: " + isValid);
            return isValid;
        } catch (Exception e) {
            logger.severe("Error validating payment response: " + e.getMessage());
            return false;
        }
    }

    /**
     * Generate HMAC SHA512 signature for VNPay request
     * This is the proper algorithm required by VNPay
     */
    private String generateHmacSHA512(String data) {
        try {
            Mac hmac = Mac.getInstance(HMAC_SHA512);
            SecretKeySpec secretKey = new SecretKeySpec(
                hashSecret.getBytes(StandardCharsets.UTF_8),
                0,
                hashSecret.getBytes(StandardCharsets.UTF_8).length,
                HMAC_SHA512
            );
            hmac.init(secretKey);
            byte[] hmacData = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            
            StringBuilder sb = new StringBuilder();
            for (byte b : hmacData) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            logger.severe("Error generating HMAC SHA512: " + e.getMessage());
            throw new RuntimeException("Failed to generate HMAC SHA512", e);
        }
    }

    private String buildQueryString(Map<String, String> params) throws UnsupportedEncodingException {
        StringBuilder query = new StringBuilder();
        Iterator<Map.Entry<String, String>> itr = params.entrySet().iterator();
        while (itr.hasNext()) {
            Map.Entry<String, String> entry = itr.next();
            query.append(URLEncoder.encode(entry.getKey(), StandardCharsets.US_ASCII.toString()));
            query.append("=");
            query.append(URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII.toString()));
            if (itr.hasNext()) {
                query.append("&");
            }
        }
        return query.toString();
    }
}
