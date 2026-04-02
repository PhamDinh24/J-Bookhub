package com.bookstore.controller;

import com.bookstore.exception.ValidationException;
import com.bookstore.model.Author;
import com.bookstore.repository.AuthorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/authors")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AuthorController {
    @Autowired
    private AuthorRepository authorRepository;

    @GetMapping
    public ResponseEntity<List<Author>> getAllAuthors() {
        return ResponseEntity.ok(authorRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Author> getAuthorById(@PathVariable Integer id) {
        return authorRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Author> createAuthor(@RequestBody Author author) {
        String name = author.getName() != null ? author.getName().trim() : "";
        if (name.isEmpty()) {
            throw new ValidationException("Tên tác giả không được để trống");
        }

        if (authorRepository.existsByNameIgnoreCase(name)) {
            throw new ValidationException("Tác giả với tên này đã tồn tại");
        }

        author.setName(name);
        Author savedAuthor = authorRepository.save(author);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedAuthor);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Author> updateAuthor(@PathVariable Integer id, @RequestBody Author authorDetails) {
        String name = authorDetails.getName() != null ? authorDetails.getName().trim() : "";
        if (name.isEmpty()) {
            throw new ValidationException("Tên tác giả không được để trống");
        }

        return authorRepository.findById(id).map(author -> {
            if (!author.getName().equalsIgnoreCase(name) && authorRepository.existsByNameIgnoreCase(name)) {
                throw new ValidationException("Tác giả với tên này đã tồn tại");
            }

            author.setName(name);
            author.setBio(authorDetails.getBio());
            author.setImageUrl(authorDetails.getImageUrl());
            return ResponseEntity.ok(authorRepository.save(author));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAuthor(@PathVariable Integer id) {
        authorRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
