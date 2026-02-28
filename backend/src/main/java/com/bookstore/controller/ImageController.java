package com.bookstore.controller;

import com.bookstore.service.CloudinaryService;
import com.bookstore.service.MockCloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/images")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class ImageController {

    @Autowired(required = false)
    private CloudinaryService cloudinaryService;

    @Autowired
    private MockCloudinaryService mockCloudinaryService;

    @Value("${cloudinary.cloud-name:}")
    private String cloudinaryCloudName;

    /**
     * Upload book cover image
     * @param file MultipartFile to upload
     * @param bookId Book ID to ensure unique image per book
     */
    @PostMapping("/upload/book-cover")
    public ResponseEntity<?> uploadBookCover(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "bookId", required = false) Integer bookId) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File is empty");
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body("File must be an image");
            }

            // Use appropriate service based on configuration
            String imageUrl;
            if (cloudinaryService != null && !cloudinaryCloudName.isEmpty()) {
                // If bookId provided, use it to create unique public ID
                if (bookId != null) {
                    String publicId = "book_" + bookId + "_" + System.currentTimeMillis();
                    imageUrl = cloudinaryService.uploadImageWithId(file, "book-covers", publicId);
                } else {
                    imageUrl = cloudinaryService.uploadImage(file, "book-covers");
                }
            } else {
                // Mock service also supports uploadImageWithId
                if (bookId != null) {
                    String publicId = "book_" + bookId + "_" + System.currentTimeMillis();
                    imageUrl = mockCloudinaryService.uploadImageWithId(file, "book-covers", publicId);
                } else {
                    imageUrl = mockCloudinaryService.uploadImage(file, "book-covers");
                }
            }

            Map<String, String> response = new HashMap<>();
            response.put("url", imageUrl);
            response.put("message", "Image uploaded successfully");

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error uploading image: " + e.getMessage());
        }
    }

    /**
     * Upload user avatar
     */
    @PostMapping("/upload/avatar")
    public ResponseEntity<?> uploadAvatar(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File is empty");
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body("File must be an image");
            }

            // Use appropriate service based on configuration
            String imageUrl;
            if (cloudinaryService != null && !cloudinaryCloudName.isEmpty()) {
                imageUrl = cloudinaryService.uploadImage(file, "avatars");
            } else {
                imageUrl = mockCloudinaryService.uploadImage(file, "avatars");
            }

            Map<String, String> response = new HashMap<>();
            response.put("url", imageUrl);
            response.put("message", "Avatar uploaded successfully");

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error uploading avatar: " + e.getMessage());
        }
    }

    /**
     * Upload generic image
     */
    @PostMapping("/upload")
    public ResponseEntity<?> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "general") String folder) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File is empty");
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body("File must be an image");
            }

            // Use appropriate service based on configuration
            String imageUrl;
            if (cloudinaryService != null && !cloudinaryCloudName.isEmpty()) {
                imageUrl = cloudinaryService.uploadImage(file, folder);
            } else {
                imageUrl = mockCloudinaryService.uploadImage(file, folder);
            }

            Map<String, String> response = new HashMap<>();
            response.put("url", imageUrl);
            response.put("message", "Image uploaded successfully");

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error uploading image: " + e.getMessage());
        }
    }

    /**
     * Health check for image service
     */
    @GetMapping("/health")
    public ResponseEntity<?> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "Image service is running");
        return ResponseEntity.ok(response);
    }
}
