-- J-Bookhub Database Schema
-- Optimized and Improved Database Design
-- Generated: 2026-03-02

-- ============================================
-- TABLE: users
-- ============================================
DROP TABLE IF EXISTS users;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone_number` varchar(20) COLLATE utf8mb4_unicode_ci,
  `address` text COLLATE utf8mb4_unicode_ci,
  `role` enum('admin', 'customer') NOT NULL DEFAULT 'customer',
  `account_status` enum('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
  `last_login` datetime(6),
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime(6) DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email_unique` (`email`),
  INDEX `idx_role` (`role`),
  INDEX `idx_account_status` (`account_status`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: categories
-- ============================================
DROP TABLE IF EXISTS categories;
CREATE TABLE `categories` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
  `description` text COLLATE utf8mb4_unicode_ci,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime(6) DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `name_unique` (`name`),
  INDEX `idx_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: authors
-- ============================================
DROP TABLE IF EXISTS authors;
CREATE TABLE `authors` (
  `author_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
  `bio` text COLLATE utf8mb4_unicode_ci,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime(6) DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`author_id`),
  UNIQUE KEY `name_unique` (`name`),
  INDEX `idx_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: publishers
-- ============================================
DROP TABLE IF EXISTS publishers;
CREATE TABLE `publishers` (
  `publisher_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
  `contact_info` text COLLATE utf8mb4_unicode_ci,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime(6) DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`publisher_id`),
  UNIQUE KEY `name_unique` (`name`),
  INDEX `idx_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: books
-- ============================================
DROP TABLE IF EXISTS books;
CREATE TABLE `books` (
  `book_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `isbn` varchar(20) COLLATE utf8mb4_unicode_ci UNIQUE,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(10,2) NOT NULL CHECK (price >= 0),
  `stock_quantity` int NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  `publication_year` int,
  `cover_image_url` varchar(500) COLLATE utf8mb4_unicode_ci,
  `category_id` int,
  `author_id` int,
  `publisher_id` int,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime(6) DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`book_id`),
  UNIQUE KEY `isbn_unique` (`isbn`),
  INDEX `idx_category` (`category_id`),
  INDEX `idx_author` (`author_id`),
  INDEX `idx_publisher` (`publisher_id`),
  INDEX `idx_title` (`title`),
  CONSTRAINT `fk_books_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_books_author` FOREIGN KEY (`author_id`) REFERENCES `authors` (`author_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_books_publisher` FOREIGN KEY (`publisher_id`) REFERENCES `publishers` (`publisher_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: carts
-- ============================================
DROP TABLE IF EXISTS carts;
CREATE TABLE `carts` (
  `cart_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime(6) DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`cart_id`),
  UNIQUE KEY `user_id_unique` (`user_id`),
  CONSTRAINT `fk_carts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: cart_items
-- ============================================
DROP TABLE IF EXISTS cart_items;
CREATE TABLE `cart_items` (
  `cart_item_id` int NOT NULL AUTO_INCREMENT,
  `cart_id` int NOT NULL,
  `book_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT 1 CHECK (quantity > 0),
  `price` decimal(10,2) NOT NULL CHECK (price >= 0),
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime(6) DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`cart_item_id`),
  UNIQUE KEY `unique_cart_book` (`cart_id`, `book_id`),
  INDEX `idx_book` (`book_id`),
  CONSTRAINT `fk_cart_items_cart` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`cart_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_items_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: orders
-- ============================================
DROP TABLE IF EXISTS orders;
CREATE TABLE `orders` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `order_date` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `status` enum('pending', 'processing', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
  `total_amount` decimal(10,2) NOT NULL CHECK (total_amount >= 0),
  `shipping_address` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `cancellation_reason` text COLLATE utf8mb4_unicode_ci,
  `delivered_at` datetime(6),
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`order_id`),
  INDEX `idx_user` (`user_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_order_date` (`order_date`),
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: order_details
-- ============================================
DROP TABLE IF EXISTS order_details;
CREATE TABLE `order_details` (
  `order_detail_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `book_id` int NOT NULL,
  `quantity` int NOT NULL CHECK (quantity > 0),
  `unit_price` decimal(10,2) NOT NULL CHECK (unit_price >= 0),
  `subtotal` decimal(10,2) NOT NULL CHECK (subtotal >= 0),
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_detail_id`),
  INDEX `idx_order` (`order_id`),
  INDEX `idx_book` (`book_id`),
  CONSTRAINT `fk_order_details_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_details_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: payments
-- ============================================
DROP TABLE IF EXISTS payments;
CREATE TABLE `payments` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL CHECK (amount >= 0),
  `method` enum('credit_card', 'debit_card', 'bank_transfer', 'e_wallet', 'cash_on_delivery') NOT NULL,
  `status` enum('pending', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
  `transaction_id` varchar(255) COLLATE utf8mb4_unicode_ci UNIQUE,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`payment_id`),
  UNIQUE KEY `order_id_unique` (`order_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_method` (`method`),
  CONSTRAINT `fk_payments_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: reviews
-- ============================================
DROP TABLE IF EXISTS reviews;
CREATE TABLE `reviews` (
  `review_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `book_id` int NOT NULL,
  `rating` int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  `comment` text COLLATE utf8mb4_unicode_ci,
  `approval_status` enum('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime(6) DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`review_id`),
  UNIQUE KEY `unique_user_book` (`user_id`, `book_id`),
  INDEX `idx_book` (`book_id`),
  INDEX `idx_approval_status` (`approval_status`),
  INDEX `idx_rating` (`rating`),
  CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Sample Data
-- ============================================

-- Insert sample categories (unique only)
INSERT INTO categories (name, description) VALUES 
('Tiểu thuyết', 'Sách tiểu thuyết, truyện ngắn'),
('Kinh tế', 'Sách về kinh tế, quản lý, kinh doanh'),
('Truyện tranh', 'Sách truyện tranh, manga'),
('Công nghệ', 'Sách về công nghệ, lập trình, IT'),
('Khoa học', 'Sách về khoa học, vật lý, hóa học, sinh học'),
('Lịch sử', 'Sách về lịch sử, tiểu sử'),
('Tâm lý', 'Sách về tâm lý, phát triển bản thân'),
('Ngoại ngữ', 'Sách học ngoại ngữ');

-- Insert sample authors
INSERT INTO authors (name, bio) VALUES 
('Haruki Murakami', 'Nhà văn Nhật Bản nổi tiếng'),
('Napoleon Hill', 'Tác giả của Nghĩ Giàu Làm Giàu'),
('J.K. Rowling', 'Tác giả của series Harry Potter'),
('George Orwell', 'Tác giả của 1984 và Animal Farm'),
('Stephen King', 'Nhà văn kinh dị nổi tiếng'),
('Paulo Coelho', 'Tác giả của The Alchemist'),
('Nguyễn Nhật Ánh', 'Nhà văn Việt Nam nổi tiếng');

-- Insert sample publishers
INSERT INTO publishers (name, contact_info) VALUES 
('Nhà Xuất Bản Trẻ', '161 Nguyễn Huệ, Quận 1, TP.HCM'),
('Nhà Xuất Bản Kim Đồng', '55 Quang Trung, Quận Hoàn Kiếm, Hà Nội'),
('Nhà Xuất Bản Văn Học', '7A Tạo Đàn, Quận Hoàn Kiếm, Hà Nội'),
('Nhà Xuất Bản Thế Giới', '46 Trăng Táo, Quận Hoàn Kiếm, Hà Nội');

-- Insert sample books
INSERT INTO books (title, isbn, description, price, stock_quantity, publication_year, category_id, author_id, publisher_id) VALUES 
('Rừng Na Uy', '978-604-67-0001-1', 'Tác phẩm kinh điển của Haruki Murakami', 150000.00, 30, 2020, 1, 1, 1),
('Nghĩ Giàu Làm Giàu', '978-604-67-0002-8', 'Cuốn sách truyền cảm hứng về thành công', 110000.00, 50, 2019, 2, 2, 2),
('Harry Potter and the Philosopher\'s Stone', '978-604-67-0003-5', 'Phần đầu tiên của series Harry Potter', 150000.00, 60, 2018, 3, 3, 3),
('1984', '978-604-67-0004-2', 'Tiểu thuyết khoa học viễn tưởng kinh điển', 95000.00, 40, 2017, 1, 4, 4),
('The Shining', '978-604-67-0005-9', 'Tác phẩm kinh dị nổi tiếng', 110000.00, 35, 2019, 1, 5, 1),
('The Alchemist', '978-604-67-0006-6', 'Cuốn sách truyền cảm hứng', 85000.00, 55, 2020, 2, 6, 2);

-- Insert sample users
INSERT INTO users (full_name, email, password_hash, phone_number, address, role, account_status) VALUES 
('Admin System', 'admin@jbookhub.com', '$2a$10$dXJ3SW6G7P50eS3B.kP7/.BCYY15gSvqn8w9wsihUP1aROK/H2uSm', NULL, NULL, 'admin', 'active'),
('Nguyễn Văn Khách', 'khachhang@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVm', '0901234567', '123 Nguyễn Huệ, TP.HCM', 'customer', 'active'),
('Trần Thị Bình', 'customer1@example.com', '$2a$10$slYQmyNdGzin7olVN3p5Be7DlH.PKZbv5H8KnzzVgXXbVxzy990qm', '0912345678', '456 Lê Lợi, Hà Nội', 'customer', 'active'),
('Phạm Văn Cường', 'customer2@example.com', '$2a$10$slYQmyNdGzin7olVN3p5Be7DlH.PKZbv5H8KnzzVgXXbVxzy990qm', '0923456789', '789 Trần Hưng Đạo, Đà Nẵng', 'customer', 'active');
