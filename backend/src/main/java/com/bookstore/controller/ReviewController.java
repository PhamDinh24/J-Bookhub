package com.bookstore.controller;

import com.bookstore.model.Review;
import com.bookstore.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class ReviewController {
    
    @Autowired
    private ReviewRepository reviewRepository;

    @GetMapping
    public ResponseEntity<List<Review>> getAllReviews() {
        try {
            List<Review> reviews = reviewRepository.findAll();
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Review> getReviewById(@PathVariable Integer id) {
        try {
            Optional<Review> review = reviewRepository.findById(id);
            return review.map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable Integer id) {
        try {
            if (reviewRepository.existsById(id)) {
                reviewRepository.deleteById(id);
                return ResponseEntity.ok().build();
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateReview(@PathVariable Integer id, @RequestBody Review reviewDetails) {
        try {
            return reviewRepository.findById(id)
                    .map(review -> {
                        if (reviewDetails.getRating() != null) {
                            review.setRating(reviewDetails.getRating());
                        }
                        if (reviewDetails.getComment() != null) {
                            review.setComment(reviewDetails.getComment());
                        }
                        Review updated = reviewRepository.save(review);
                        return ResponseEntity.ok(updated);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/filter")
    public ResponseEntity<?> filterReviews(
            @RequestParam(required = false) Integer rating,
            @RequestParam(required = false) Integer bookId) {
        try {
            List<Review> reviews = reviewRepository.findAll();
            
            if (rating != null) {
                reviews = reviews.stream()
                        .filter(r -> r.getRating().equals(rating))
                        .toList();
            }
            
            if (bookId != null) {
                reviews = reviews.stream()
                        .filter(r -> r.getBook() != null && r.getBook().getBookId().equals(bookId))
                        .toList();
            }
            
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
}
