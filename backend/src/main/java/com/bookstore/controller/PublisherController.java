package com.bookstore.controller;

import com.bookstore.exception.ValidationException;
import com.bookstore.model.Publisher;
import com.bookstore.repository.PublisherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/publishers")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class PublisherController {
    @Autowired
    private PublisherRepository publisherRepository;

    @GetMapping
    public ResponseEntity<List<Publisher>> getAllPublishers() {
        return ResponseEntity.ok(publisherRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Publisher> getPublisherById(@PathVariable Integer id) {
        return publisherRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Publisher> createPublisher(@RequestBody Publisher publisher) {
        String name = publisher.getName() != null ? publisher.getName().trim() : "";
        if (name.isEmpty()) {
            throw new ValidationException("Tên nhà xuất bản không được để trống");
        }

        if (publisherRepository.existsByNameIgnoreCase(name)) {
            throw new ValidationException("Nhà xuất bản với tên này đã tồn tại");
        }

        publisher.setName(name);
        Publisher savedPublisher = publisherRepository.save(publisher);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPublisher);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Publisher> updatePublisher(@PathVariable Integer id, @RequestBody Publisher publisherDetails) {
        String name = publisherDetails.getName() != null ? publisherDetails.getName().trim() : "";
        if (name.isEmpty()) {
            throw new ValidationException("Tên nhà xuất bản không được để trống");
        }

        return publisherRepository.findById(id).map(publisher -> {
            if (!publisher.getName().equalsIgnoreCase(name) && publisherRepository.existsByNameIgnoreCase(name)) {
                throw new ValidationException("Nhà xuất bản với tên này đã tồn tại");
            }

            publisher.setName(name);
            publisher.setContactInfo(publisherDetails.getContactInfo());
            publisher.setImageUrl(publisherDetails.getImageUrl());
            return ResponseEntity.ok(publisherRepository.save(publisher));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePublisher(@PathVariable Integer id) {
        publisherRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
