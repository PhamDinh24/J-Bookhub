# J-Bookhub - Hệ Thống Bán Sách Trực Tuyến
## Tài Liệu Thiết Kế (Design Document)

**Phiên bản:** 1.0.0  
**Ngày cập nhật:** 28/02/2026  
**Trạng thái:** Hoàn thành thiết kế

---

## 1. Tổng Quan Kiến Trúc

### 1.1 Kiến Trúc Tổng Thể
J-Bookhub sử dụng kiến trúc **3-tier** (ba tầng):
- **Frontend (Client):** React.js - Giao diện người dùng responsive
- **Backend (Server):** Spring Boot - API RESTful, xử lý logic nghiệp vụ
- **Database:** MySQL - Lưu trữ dữ liệu persistent

### 1.2 Luồng Dữ Liệu
```
Client (React) ←→ Backend API (Spring Boot) ←→ Database (MySQL)
                        ↓
                   VNPay Gateway
```

### 1.3 Nguyên Tắc Thiết Kế
- **Separation of Concerns:** Tách biệt logic, presentation, data access
- **RESTful API:** Sử dụng HTTP methods chuẩn (GET, POST, PUT, DELETE)
- **JWT Authentication:** Xác thực stateless với token
- **Error Handling:** Xử lý lỗi graceful với response codes phù hợp

---

## 2. Thiết Kế Cơ Sở Dữ Liệu

### 2.1 Sơ Đồ Entity-Relationship (ERD)

**Các Entity Chính:**
- `users` - Thông tin người dùng
- `books` - Thông tin sách
- `categories` - Danh mục sách
- `authors` - Tác giả
- `publishers` - Nhà xuất bản
- `carts` - Giỏ hàng
- `cart_items` - Chi tiết giỏ hàng
- `orders` - Đơn hàng
- `order_details` - Chi tiết đơn hàng
- `payments` - Giao dịch thanh toán
- `reviews` - Đánh giá sách

### 2.2 Mô Tả Các Bảng Chính

#### Users
```
- id (PK)
- email (UNIQUE)
- password (hashed with BCrypt)
- full_name
- phone
- address
- avatar_url
- role (CUSTOMER, ADMIN)
- is_active
- created_at
- updated_at
```

#### Books
```
- id (PK)
- title
- description
- price
- stock_quantity
- category_id (FK)
- author_id (FK)
- publisher_id (FK)
- cover_image_url
- isbn
- publication_date
- created_at
- updated_at
```

#### Orders
```
- id (PK)
- user_id (FK)
- total_amount
- status (PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
- shipping_address
- created_at
- updated_at
```

#### Payments
```
- id (PK)
- order_id (FK)
- amount
- method (VNPAY, COD)
- status (PENDING, COMPLETED, FAILED)
- transaction_id
- created_at
- updated_at
```

#### Reviews
```
- id (PK)
- book_id (FK)
- user_id (FK)
- rating (1-5)
- comment
- created_at
- updated_at
```

---

## 3. Thiết Kế API

### 3.1 Cấu Trúc Response

**Success Response:**
```json
{
  "success": true,
  "data": { /* payload */ },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Error description"
}
```

### 3.2 Endpoints Chính

#### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `POST /api/auth/refresh-token` - Làm mới token

#### Books
- `GET /api/books` - Danh sách sách (với filter, search, pagination)
- `GET /api/books/:id` - Chi tiết sách
- `POST /api/books` - Thêm sách (Admin)
- `PUT /api/books/:id` - Cập nhật sách (Admin)
- `DELETE /api/books/:id` - Xóa sách (Admin)

#### Cart
- `GET /api/cart` - Lấy giỏ hàng
- `POST /api/cart/items` - Thêm vào giỏ
- `PUT /api/cart/items/:id` - Cập nhật số lượng
- `DELETE /api/cart/items/:id` - Xóa khỏi giỏ
- `DELETE /api/cart` - Xóa toàn bộ giỏ

#### Orders
- `POST /api/orders` - Tạo đơn hàng
- `GET /api/orders` - Danh sách đơn hàng (của user)
- `GET /api/orders/:id` - Chi tiết đơn hàng
- `PUT /api/orders/:id/status` - Cập nhật trạng thái (Admin)
- `DELETE /api/orders/:id` - Hủy đơn hàng

#### Payments
- `POST /api/payments/vnpay` - Khởi tạo thanh toán VNPay
- `GET /api/payments/vnpay/callback` - Callback từ VNPay
- `GET /api/payments` - Danh sách giao dịch (Admin)

#### Admin Reports
- `GET /api/admin/reports/revenue` - Thống kê doanh thu
- `GET /api/admin/reports/top-books` - Sách bán chạy
- `GET /api/admin/reports/inventory` - Kho hàng
- `GET /api/admin/reports/orders` - Báo cáo đơn hàng
- `POST /api/admin/reports/export` - Xuất báo cáo

#### Users (Admin)
- `GET /api/admin/users` - Danh sách người dùng
- `GET /api/admin/users/:id` - Chi tiết người dùng
- `PUT /api/admin/users/:id/status` - Khóa/mở khóa tài khoản

#### Categories, Authors, Publishers
- `GET /api/categories` - Danh sách danh mục
- `POST /api/categories` - Thêm danh mục (Admin)
- `PUT /api/categories/:id` - Cập nhật danh mục (Admin)
- `DELETE /api/categories/:id` - Xóa danh mục (Admin)
- Tương tự cho `/api/authors` và `/api/publishers`

---

## 4. Thiết Kế Frontend

### 4.1 Cấu Trúc Thư Mục
```
frontend/src/
├── components/          # Reusable components
│   ├── Header.jsx
│   ├── Footer.jsx
│   ├── ProtectedRoute.jsx
│   └── ImageUpload.jsx
├── pages/              # Page components
│   ├── Home.jsx
│   ├── BookList.jsx
│   ├── BookDetail.jsx
│   ├── Cart.jsx
│   ├── Checkout.jsx
│   ├── OrderHistory.jsx
│   ├── Profile.jsx
│   ├── Login.jsx
│   ├── Signup.jsx
│   └── Admin/          # Admin pages
│       ├── AdminDashboard.jsx
│       ├── AdminBooks.jsx
│       ├── AdminOrders.jsx
│       ├── AdminReports.jsx
│       └── ...
├── context/            # State management
│   ├── AuthContext.jsx
│   └── CartContext.jsx
├── services/           # API calls
│   ├── api.js
│   ├── bookService.js
│   ├── orderService.js
│   └── ...
└── styles/             # CSS files
```

### 4.2 State Management
- **AuthContext:** Quản lý trạng thái xác thực, user info, token
- **CartContext:** Quản lý giỏ hàng (thêm, xóa, cập nhật)
- **localStorage:** Lưu giỏ hàng, token

### 4.3 Tính Năng Chính

#### Tìm Kiếm và Lọc
- **Search:** Debounce 300ms, tìm kiếm theo tên sách
- **Filters:** Tác giả, NXB, khoảng giá, rating, tình trạng kho
- **Autocomplete:** Gợi ý tên sách khi nhập
- **Real-time:** Cập nhật kết quả ngay khi thay đổi filter

#### Gợi Ý Sách
- **Viewed Books:** Lưu sách đã xem, hiển thị "Sách tương tự"
- **Purchased Books:** Gợi ý dựa trên danh mục sách đã mua
- **Trending:** Hiển thị "Sách bán chạy" trong danh mục
- **Co-purchased:** Sách được mua cùng trong đơn hàng khác

#### Giỏ Hàng
- Lưu trữ trong localStorage
- Hiển thị badge số lượng trên header
- Cho phép thay đổi số lượng, xóa item
- Tính toán tổng tiền tự động

#### Thanh Toán
- **VNPay:** Chuyển hướng đến cổng VNPay, xử lý callback
- **COD:** Tạo đơn hàng trực tiếp, trạng thái "Chờ xử lý"
- **Confirmation:** Hiển thị trang xác nhận thanh toán

---

## 5. Thiết Kế Backend

### 5.1 Cấu Trúc Thư Mục
```
backend/src/main/java/com/bookstore/
├── config/             # Configuration
│   ├── SecurityConfig.java
│   └── JwtAuthenticationFilter.java
├── controller/         # REST Controllers
│   ├── AuthController.java
│   ├── BookController.java
│   ├── OrderController.java
│   ├── PaymentController.java
│   ├── AdminController.java
│   └── ...
├── service/            # Business Logic
│   ├── BookService.java
│   ├── OrderService.java
│   ├── PaymentService.java
│   ├── UserService.java
│   ├── VNPayService.java
│   └── ReportService.java
├── repository/         # Data Access
│   ├── BookRepository.java
│   ├── OrderRepository.java
│   ├── UserRepository.java
│   └── ...
├── model/              # Entity Classes
│   ├── User.java
│   ├── Book.java
│   ├── Order.java
│   ├── Payment.java
│   └── ...
├── dto/                # Data Transfer Objects
│   ├── BookDTO.java
│   ├── OrderDTO.java
│   ├── AuthRequest.java
│   └── ...
├── exception/          # Custom Exceptions
│   ├── ResourceNotFoundException.java
│   ├── UnauthorizedException.java
│   └── GlobalExceptionHandler.java
└── util/               # Utilities
    ├── JwtUtil.java
    └── Constants.java
```

### 5.2 Xác Thực và Phân Quyền

**JWT Flow:**
1. User đăng nhập → Backend tạo JWT token
2. Client lưu token trong localStorage
3. Mỗi request gửi token trong header `Authorization: Bearer <token>`
4. Backend validate token, trích xuất user info
5. Kiểm tra quyền (role-based access control)

**Roles:**
- `CUSTOMER` - Người dùng thường
- `ADMIN` - Quản trị viên

### 5.3 Xử Lý Thanh Toán VNPay

**Flow:**
1. User chọn thanh toán VNPay → Backend tạo request VNPay
2. Backend tạo URL thanh toán, redirect client
3. User thanh toán trên VNPay
4. VNPay callback về backend
5. Backend verify signature, cập nhật trạng thái đơn hàng
6. Redirect user đến trang xác nhận

**Security:**
- Verify VNPay signature trên mỗi callback
- Lưu transaction ID để tránh duplicate
- Timeout xử lý thanh toán

### 5.4 Xử Lý Kho Hàng

**Inventory Management:**
- Giảm stock khi tạo đơn hàng (pending)
- Hoàn lại stock nếu hủy đơn hàng
- Cảnh báo khi stock < ngưỡng (mặc định 10)
- Không cho phép tạo đơn nếu stock không đủ

---

## 6. Thiết Kế Báo Cáo

### 6.1 Báo Cáo Doanh Thu
- Tính toán doanh thu từ các đơn hàng đã giao
- Hỗ trợ lọc theo khoảng thời gian
- Hiển thị biểu đồ xu hướng doanh thu
- Xuất dữ liệu dạng Excel, CSV, Word

### 6.2 Báo Cáo Sách Bán Chạy
- Top 10 sách theo số lượng bán
- Hiển thị: tên sách, số lượng, doanh thu
- Lọc theo danh mục, khoảng thời gian
- Biểu đồ so sánh

### 6.3 Báo Cáo Kho Hàng
- Sách tồn kho lâu ngày (chưa bán)
- Hiển thị: tên sách, số lượng tồn, ngày thêm, giá
- Gợi ý chiến lược (giảm giá, khuyến mãi)
- Xuất báo cáo

### 6.4 Xuất Báo Cáo
- **Excel:** Sử dụng Apache POI
- **CSV:** Format chuẩn, hỗ trợ Unicode
- **Word:** Sử dụng Apache POI XWPF

---

## 7. Bảo Mật

### 7.1 Mã Hóa Mật Khẩu
- Sử dụng BCrypt với salt rounds = 10
- Không lưu mật khẩu plain text

### 7.2 Xác Thực
- JWT token với expiration time = 24 giờ
- Refresh token để gia hạn session
- Token lưu trong localStorage (client)

### 7.3 CORS
- Cấu hình CORS cho frontend domain
- Chỉ cho phép các method cần thiết (GET, POST, PUT, DELETE)

### 7.4 HTTPS
- Tất cả giao dịch thanh toán qua HTTPS
- Redirect HTTP → HTTPS

### 7.5 Validation
- Validate input trên cả client và server
- Sanitize dữ liệu trước khi lưu database
- Kiểm tra authorization trên mỗi endpoint

---

## 8. Hiệu Năng

### 8.1 Caching
- Cache danh sách danh mục (TTL: 1 giờ)
- Cache danh sách tác giả, NXB (TTL: 1 giờ)
- Cache sách bán chạy (TTL: 30 phút)

### 8.2 Pagination
- Danh sách sách: 20 items/page
- Danh sách đơn hàng: 10 items/page
- Danh sách người dùng: 20 items/page

### 8.3 Database Optimization
- Index trên: email, book title, order status
- Query optimization với JOIN khi cần
- Lazy loading cho relationships

### 8.4 Frontend Optimization
- Code splitting cho admin pages
- Lazy loading images
- Debounce search (300ms)
- Throttle scroll events

---

## 9. Xử Lý Lỗi

### 9.1 HTTP Status Codes
- `200 OK` - Thành công
- `201 Created` - Tạo mới thành công
- `400 Bad Request` - Dữ liệu không hợp lệ
- `401 Unauthorized` - Chưa xác thực
- `403 Forbidden` - Không có quyền
- `404 Not Found` - Không tìm thấy
- `500 Internal Server Error` - Lỗi server

### 9.2 Error Messages
- Thông báo lỗi rõ ràng, hữu ích
- Hỗ trợ tiếng Việt
- Ghi log chi tiết trên server

---

## 10. Quy Trình Thanh Toán Chi Tiết

### 10.1 VNPay Flow
```
1. User chọn VNPay → POST /api/payments/vnpay
2. Backend tạo VNPay request (amount, order info, etc.)
3. Backend tạo secure hash (HMAC SHA512)
4. Redirect user đến VNPay gateway
5. User thanh toán trên VNPay
6. VNPay callback → GET /api/payments/vnpay/callback
7. Backend verify signature
8. Backend cập nhật Payment status = COMPLETED
9. Backend cập nhật Order status = PROCESSING
10. Redirect user → PaymentSuccess page
```

### 10.2 COD Flow
```
1. User chọn COD → POST /api/orders
2. Backend tạo Order (status = PENDING)
3. Backend tạo Payment (method = COD, status = PENDING)
4. Giảm stock
5. Redirect user → OrderHistory
```

---

## 11. Quy Trình Gợi Ý Sách

### 11.1 Sách Tương Tự
- Lấy danh mục của sách hiện tại
- Lấy 5 sách khác trong danh mục (random hoặc top rated)

### 11.2 Sách Được Mua Cùng
- Lấy các đơn hàng chứa sách hiện tại
- Lấy các sách khác trong những đơn hàng đó
- Sắp xếp theo tần suất xuất hiện

### 11.3 Sách Bán Chạy
- Lấy top 5 sách theo số lượng bán trong 30 ngày gần nhất

---

## 12. Thiết Kế Giao Diện

### 12.1 Responsive Design
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### 12.2 Thành Phần Chính
- **Header:** Logo, search bar, cart badge, user menu
- **Sidebar (Admin):** Navigation menu
- **Footer:** Links, contact info
- **Modal:** Confirm dialogs, forms
- **Toast:** Notifications

### 12.3 Trang Chính
- **Home:** Featured books, categories, trending
- **BookList:** Grid view, filters, search
- **BookDetail:** Cover, info, reviews, recommendations
- **Cart:** Item list, quantity, total, checkout button
- **Checkout:** Shipping info, payment method selection
- **OrderHistory:** Order list, status, details
- **AdminDashboard:** Stats, charts, quick actions

---

## 13. Quy Trình Phát Triển

### Phase 1: MVP (Hoàn thành)
- Authentication, Book listing, Cart, COD payment

### Phase 2: VNPay Integration (Hoàn thành)
- VNPay payment, Transaction management

### Phase 3: Reports (Hoàn thành)
- Revenue reports, Top books, Inventory reports

### Phase 4: Optimization (Đang thực hiện)
- Smart recommendations, Performance tuning, UX improvements

---

## 14. Công Nghệ Sử Dụng

| Layer | Technology | Lý Do |
|-------|-----------|-------|
| Frontend | React.js | Component-based, large ecosystem |
| Backend | Spring Boot | Enterprise-grade, security features |
| Database | MySQL | Relational, reliable, widely used |
| Auth | JWT | Stateless, scalable |
| Payment | VNPay | Popular in Vietnam |
| Image Storage | Cloudinary | Cloud-based, CDN support |
| Export | Apache POI | Excel, Word generation |

---

**Tài liệu này được cập nhật lần cuối vào 28/02/2026**
