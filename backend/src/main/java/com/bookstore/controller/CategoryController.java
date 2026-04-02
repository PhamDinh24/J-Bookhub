package com.bookstore.controller;

import com.bookstore.exception.ValidationException;
import com.bookstore.model.Category;
import com.bookstore.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable Integer id) {
        return categoryRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Category> createCategory(@RequestBody Category category) {
        String name = category.getName() != null ? category.getName().trim() : "";
        if (name.isEmpty()) {
            throw new ValidationException("Tên danh mục không được để trống");
        }

        if (categoryRepository.existsByNameIgnoreCase(name)) {
            throw new ValidationException("Danh mục với tên này đã tồn tại");
        }

        category.setName(name);

        Category savedCategory = categoryRepository.save(category);
        return ResponseEntity.ok(savedCategory);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable Integer id, @RequestBody Category category) {
        String name = category.getName() != null ? category.getName().trim() : "";
        if (name.isEmpty()) {
            throw new ValidationException("Tên danh mục không được để trống");
        }

        return categoryRepository.findById(id)
                .map(existingCategory -> {
                    if (!existingCategory.getName().equalsIgnoreCase(name) && categoryRepository.existsByNameIgnoreCase(name)) {
                        throw new ValidationException("Danh mục với tên này đã tồn tại");
                    }

                    existingCategory.setName(name);
                    existingCategory.setDescription(category.getDescription());
                    existingCategory.setImageUrl(category.getImageUrl());
                    Category updatedCategory = categoryRepository.save(existingCategory);
                    return ResponseEntity.ok(updatedCategory);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Integer id) {
        if (categoryRepository.existsById(id)) {
            categoryRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
