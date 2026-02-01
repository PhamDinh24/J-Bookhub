package com.bookstore.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.logging.Logger;

@Service
public class VNPayService {
    private static final Logger logger = Logger.getLogger(VNPayService.class.getName());

    @Value("${vnpay.tmnCode}")
    private String tmnCode;

    @Value("${vnpay.hashSecret}")
    private String hashSecret;

    @Value("${vnpay.apiUrl}")
    private String apiUrl;

    public String createPaymentUrl(Long orderId, Long amount, String orderInfo, String returnUrl) {
        try {
            logger.info("Creating VNPay payment URL for order: " + orderId + ", amount: " + amount);
            
            Map<String, String> vnpParams = new TreeMap<>();
            vnpParams.put("vnp_Version", "2.1.0");
            vnpParams.put("vnp_Command", "pay");
            vnpParams.put("vnp_TmnCode", tmnCode);
            vnpParams.put("vnp_Amount", String.valueOf(amount));
            vnpParams.put("vnp_CurrCode", "VND");
            vnpParams.put("vnp_TxnRef", String.valueOf(orderId));
            vnpParams.put("vnp_OrderInfo", URLEncoder.encode(orderInfo, StandardCharsets.UTF_8.toString()));
            vnpParams.put("vnp_OrderType", "other");
            vnpParams.put("vnp_Locale", "vn");
            vnpParams.put("vnp_ReturnUrl", returnUrl);
            vnpParams.put("vnp_CreateDate", new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()));
            vnpParams.put("vnp_IpAddr", "127.0.0.1");

            StringBuilder query = new StringBuilder();
            Iterator<Map.Entry<String, String>> itr = vnpParams.entrySet().iterator();
            while (itr.hasNext()) {
                Map.Entry<String, String> entry = itr.next();
                query.append(URLEncoder.encode(entry.getKey(), StandardCharsets.US_ASCII.toString()));
                query.append("=");
                query.append(URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII.toString()));
                if (itr.hasNext()) {
                    query.append("&");
                }
            }

            String queryUrl = query.toString();
            String vnpSecureHash = generateSecureHash(queryUrl);
            String paymentUrl = apiUrl + "?" + queryUrl + "&vnp_SecureHash=" + vnpSecureHash;
            
            logger.info("Payment URL created: " + paymentUrl.substring(0, Math.min(100, paymentUrl.length())) + "...");
            return paymentUrl;
        } catch (UnsupportedEncodingException e) {
            logger.severe("Error creating payment URL: " + e.getMessage());
            throw new RuntimeException(e);
        }
    }

    public boolean validatePaymentResponse(Map<String, String> params) {
        try {
            String vnpSecureHash = params.get("vnp_SecureHash");
            String vnpSecureHashType = params.get("vnp_SecureHashType");
            
            params.remove("vnp_SecureHash");
            params.remove("vnp_SecureHashType");

            String queryUrl = buildQueryString(params);
            String calculatedHash = generateSecureHash(queryUrl);
            
            boolean isValid = vnpSecureHash.equals(calculatedHash);
            logger.info("Payment validation result: " + isValid);
            return isValid;
        } catch (Exception e) {
            logger.severe("Error validating payment response: " + e.getMessage());
            throw new RuntimeException(e);
        }
    }

    private String generateSecureHash(String data) {
        String input = data + hashSecret;
        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
            byte[] messageDigest = md.digest(input.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : messageDigest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (java.security.NoSuchAlgorithmException e) {
            logger.severe("SHA-256 algorithm not found: " + e.getMessage());
            throw new RuntimeException(e);
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
