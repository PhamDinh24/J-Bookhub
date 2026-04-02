package com.bookstore.model;

import jakarta.persistence.*;

@Entity
@Table(name = "publishers", uniqueConstraints = @UniqueConstraint(columnNames = "name"))
public class Publisher {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "publisher_id")
    private Integer publisherId;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(name = "contact_info", columnDefinition = "TEXT")
    private String contactInfo;

    @Column(name = "image_url")
    private String imageUrl;

    public Publisher() {}

    public Publisher(Integer publisherId, String name, String contactInfo) {
        this.publisherId = publisherId;
        this.name = name;
        this.contactInfo = contactInfo;
    }

    public Integer getPublisherId() { return publisherId; }
    public void setPublisherId(Integer publisherId) { this.publisherId = publisherId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getContactInfo() { return contactInfo; }
    public void setContactInfo(String contactInfo) { this.contactInfo = contactInfo; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
