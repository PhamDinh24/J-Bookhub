package com.bookstore.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.Transformation;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(
            @Value("${cloudinary.cloud-name}") String cloudName,
            @Value("${cloudinary.api-key}") String apiKey,
            @Value("${cloudinary.api-secret}") String apiSecret) {
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret
        ));
    }

    /**
     * Upload image to Cloudinary
     * @param file MultipartFile to upload
     * @param folder Folder name in Cloudinary
     * @return URL of uploaded image
     */
    public String uploadImage(MultipartFile file, String folder) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        Map uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder", "bookstore/" + folder,
                        "resource_type", "auto",
                        "quality", "auto",
                        "fetch_format", "auto"
                )
        );

        return (String) uploadResult.get("secure_url");
    }

    /**
     * Upload image with custom public ID
     * @param file MultipartFile to upload
     * @param folder Folder name in Cloudinary
     * @param publicId Custom public ID
     * @return URL of uploaded image
     */
    public String uploadImageWithId(MultipartFile file, String folder, String publicId) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        Map uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder", "bookstore/" + folder,
                        "public_id", publicId,
                        "resource_type", "auto",
                        "quality", "auto",
                        "fetch_format", "auto",
                        "overwrite", true
                )
        );

        return (String) uploadResult.get("secure_url");
    }

    /**
     * Delete image from Cloudinary
     * @param publicId Public ID of image to delete
     */
    public void deleteImage(String publicId) throws IOException {
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }

    /**
     * Get image URL with transformations
     * @param publicId Public ID of image
     * @param width Width of image
     * @param height Height of image
     * @return Transformed image URL
     */
    public String getImageUrl(String publicId, int width, int height) {
        return cloudinary.url()
                .transformation((Transformation) ObjectUtils.asMap(
                        "width", width,
                        "height", height,
                        "crop", "fill",
                        "gravity", "auto"
                ))
                .generate(publicId);
    }

    /**
     * Get thumbnail URL
     * @param publicId Public ID of image
     * @return Thumbnail URL (200x280)
     */
    public String getThumbnailUrl(String publicId) {
        return getImageUrl(publicId, 200, 280);
    }

    /**
     * Get detail image URL
     * @param publicId Public ID of image
     * @return Detail image URL (400x600)
     */
    public String getDetailImageUrl(String publicId) {
        return getImageUrl(publicId, 400, 600);
    }
}
