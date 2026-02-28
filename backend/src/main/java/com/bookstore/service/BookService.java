package com.bookstore.service;

import com.bookstore.dto.BookDTO;
import com.bookstore.model.Book;
import com.bookstore.model.Category;
import com.bookstore.model.Author;
import com.bookstore.model.Publisher;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.CategoryRepository;
import com.bookstore.repository.AuthorRepository;
import com.bookstore.repository.PublisherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class BookService {
    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private AuthorRepository authorRepository;

    @Autowired
    private PublisherRepository publisherRepository;

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    public Optional<Book> getBookById(Integer id) {
        return bookRepository.findById(id);
    }

    public Book createBook(Book book) {
        return bookRepository.save(book);
    }

    public Book createBookFromDTO(BookDTO bookDTO) {
        Book book = new Book();
        book.setTitle(bookDTO.getTitle());
        book.setDescription(bookDTO.getDescription());
        book.setPrice(bookDTO.getPrice());
        book.setStockQuantity(bookDTO.getStockQuantity());
        book.setIsbn(bookDTO.getIsbn());
        book.setPublicationYear(bookDTO.getPublicationYear());
        book.setCoverImageUrl(bookDTO.getCoverImageUrl());
        
        if (bookDTO.getCategoryId() != null) {
            Optional<Category> category = categoryRepository.findById(bookDTO.getCategoryId());
            category.ifPresent(book::setCategory);
        }
        
        if (bookDTO.getAuthorId() != null) {
            Optional<Author> author = authorRepository.findById(bookDTO.getAuthorId());
            author.ifPresent(book::setAuthor);
        }
        
        if (bookDTO.getPublisherId() != null) {
            Optional<Publisher> publisher = publisherRepository.findById(bookDTO.getPublisherId());
            publisher.ifPresent(book::setPublisher);
        }
        
        return bookRepository.save(book);
    }

    public Book updateBook(Integer id, Book bookDetails) {
        return bookRepository.findById(id).map(book -> {
            book.setTitle(bookDetails.getTitle());
            book.setDescription(bookDetails.getDescription());
            book.setPrice(bookDetails.getPrice());
            book.setStockQuantity(bookDetails.getStockQuantity());
            book.setIsbn(bookDetails.getIsbn());
            book.setPublicationYear(bookDetails.getPublicationYear());
            book.setCoverImageUrl(bookDetails.getCoverImageUrl());
            
            // Handle category
            if (bookDetails.getCategory() != null && bookDetails.getCategory().getCategoryId() != null) {
                Optional<Category> category = categoryRepository.findById(bookDetails.getCategory().getCategoryId());
                category.ifPresent(book::setCategory);
            } else {
                book.setCategory(null);
            }
            
            // Handle author
            if (bookDetails.getAuthor() != null && bookDetails.getAuthor().getAuthorId() != null) {
                Optional<Author> author = authorRepository.findById(bookDetails.getAuthor().getAuthorId());
                author.ifPresent(book::setAuthor);
            } else {
                book.setAuthor(null);
            }
            
            // Handle publisher
            if (bookDetails.getPublisher() != null && bookDetails.getPublisher().getPublisherId() != null) {
                Optional<Publisher> publisher = publisherRepository.findById(bookDetails.getPublisher().getPublisherId());
                publisher.ifPresent(book::setPublisher);
            } else {
                book.setPublisher(null);
            }
            
            return bookRepository.save(book);
        }).orElseThrow(() -> new RuntimeException("Book not found"));
    }

    public Book updateBookFromDTO(Integer id, BookDTO bookDTO) {
        return bookRepository.findById(id).map(book -> {
            book.setTitle(bookDTO.getTitle());
            book.setDescription(bookDTO.getDescription());
            book.setPrice(bookDTO.getPrice());
            book.setStockQuantity(bookDTO.getStockQuantity());
            book.setIsbn(bookDTO.getIsbn());
            book.setPublicationYear(bookDTO.getPublicationYear());
            book.setCoverImageUrl(bookDTO.getCoverImageUrl());
            
            if (bookDTO.getCategoryId() != null) {
                Optional<Category> category = categoryRepository.findById(bookDTO.getCategoryId());
                category.ifPresent(book::setCategory);
            } else {
                book.setCategory(null);
            }
            
            if (bookDTO.getAuthorId() != null) {
                Optional<Author> author = authorRepository.findById(bookDTO.getAuthorId());
                author.ifPresent(book::setAuthor);
            } else {
                book.setAuthor(null);
            }
            
            if (bookDTO.getPublisherId() != null) {
                Optional<Publisher> publisher = publisherRepository.findById(bookDTO.getPublisherId());
                publisher.ifPresent(book::setPublisher);
            } else {
                book.setPublisher(null);
            }
            
            return bookRepository.save(book);
        }).orElseThrow(() -> new RuntimeException("Book not found"));
    }

    public void deleteBook(Integer id) {
        bookRepository.deleteById(id);
    }

    public List<Book> searchBooks(String keyword) {
        return bookRepository.searchBooks(keyword);
    }

    public List<Book> getBooksByCategory(Integer categoryId) {
        Optional<Category> category = categoryRepository.findById(categoryId);
        return category.map(bookRepository::findByCategory).orElse(List.of());
    }

    public List<Book> getNewBooks(int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "bookId"));
        return bookRepository.findAll(pageable).getContent();
    }

    public List<Book> getBestsellers(int limit) {
        // For now, return the most recently added books as bestsellers
        // In a real application, this would be based on sales data
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "bookId"));
        return bookRepository.findAll(pageable).getContent();
    }

    public List<Book> getBooksByAuthor(Integer authorId) {
        Optional<Author> author = authorRepository.findById(authorId);
        return author.map(bookRepository::findByAuthor).orElse(List.of());
    }
}
