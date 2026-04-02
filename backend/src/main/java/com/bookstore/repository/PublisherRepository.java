package com.bookstore.repository;

import com.bookstore.model.Publisher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PublisherRepository extends JpaRepository<Publisher, Integer> {
    boolean existsByNameIgnoreCase(String name);
    Optional<Publisher> findByNameIgnoreCase(String name);
}
