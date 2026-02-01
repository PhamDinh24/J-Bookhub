package com.bookstore.repository;

import com.bookstore.model.Review;
import com.bookstore.model.Book;
import com.bookstore.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {
    List<Review> findByBook(Book book);
    List<Review> findByUser(User user);
}
