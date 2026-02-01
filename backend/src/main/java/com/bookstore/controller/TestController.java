package com.bookstore.controller;

import com.bookstore.model.User;
import com.bookstore.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class TestController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/create-test-user")
    public ResponseEntity<?> createTestUser() {
        try {
            // Check if user already exists
            if (userRepository.findByEmail("test@example.com").isPresent()) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Test user already exists");
                return ResponseEntity.ok(response);
            }

            // Create test user
            User testUser = new User();
            testUser.setEmail("test@example.com");
            testUser.setPasswordHash(passwordEncoder.encode("password123"));
            testUser.setFullName("Test User");
            testUser.setRole("customer");
            testUser.setPhoneNumber("0123456789");
            testUser.setAddress("123 Test Street");

            User savedUser = userRepository.save(testUser);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Test user created successfully");
            response.put("userId", savedUser.getUserId());
            response.put("email", savedUser.getEmail());
            response.put("password", "password123");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping("/all-users")
    public ResponseEntity<?> getAllUsers() {
        try {
            return ResponseEntity.ok(userRepository.findAll());
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}
