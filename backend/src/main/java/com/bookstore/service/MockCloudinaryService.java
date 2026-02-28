package com.bookstore.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

/**
 * Mock Cloudinary Service for development/testing
 * Returns placeholder URLs instead of uploading to Cloudinary
 * Use this when Cloudinary credentials are not configured
 */
@Service
public class MockCloudinaryService {

    /**
     * Mock upload - returns a placeholder URL
     * @param file MultipartFile to upload
     * @param folder Folder name (ignored in mock)
     * @return Placeholder image URL
     */
    public String uploadImage(MultipartFile file, String folder) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        // Generate a mock URL with filename
        String filename = UUID.randomUUID().toString().substring(0, 8);
        return "https://via.placeholder.com/400x600?text=Book_" + filename;
    }

    /**
     * Mock upload with custom ID
     * @param file MultipartFile to upload
     * @param folder Folder name (ignored in mock)
     * @param publicId Custom public ID (ignored in mock)
     * @return Placeholder image URL
     */
    public String uploadImageWithId(MultipartFile file, String folder, String publicId) throws IOException {
        return uploadImage(file, folder);
    }

    /**
     * Mock delete - does nothing
     * @param publicId Public ID of image to delete
     */
    public void deleteImage(String publicId) throws IOException {
        // Mock delete - do nothing
    }

    /**
     * Get mock image URL with transformations
     * @param publicId Public ID of image (ignored in mock)
     * @param width Width of image
     * @param height Height of image
     * @return Placeholder image URL
     */
    public String getImageUrl(String publicId, int width, int height) {
        return "https://via.placeholder.com/" + width + "x" + height + "?text=Image";
    }

    /**
     * Get mock thumbnail URL
     * @param publicId Public ID of image (ignored in mock)
     * @return Placeholder thumbnail URL (200x280)
     */
    public String getThumbnailUrl(String publicId) {
        return getImageUrl(publicId, 200, 280);
    }

    /**
     * Get mock detail image URL
     * @param publicId Public ID of image (ignored in mock)
     * @return Placeholder detail image URL (400x600)
     */
    public String getDetailImageUrl(String publicId) {
        return getImageUrl(publicId, 400, 600);
    }
}
