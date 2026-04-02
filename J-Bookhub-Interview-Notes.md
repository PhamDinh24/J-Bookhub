# J-Bookhub Interview Notes

## 1. Tổng quan dự án
- Tên: J-Bookhub
- Mô tả: e-commerce sách online
- Backend: Spring Boot (Java 17), RESTful API
- Frontend: React 18 + Vite
- CSDL: MySQL
- Authentication: JWT (Spring Security)
- Upload ảnh: Cloudinary + ImageUpload component

## 2. Kiến trúc chung
- Backend:
  - controller: endpoints CRUD
  - service: logic kinh doanh
  - repository: Spring Data JPA
  - model: entity mapping @Entity
  - dto: chuyển đổi request/response (BookDTO, AuthRequest, UserDTO)
  - exception: GlobalExceptionHandler, ValidationException
- Frontend:
  - pages (Admin): quản lý Books/Categories/Authors/Publishers
  - components: ImageUpload, ConfirmDeleteModal, ProtectedRoute
  - context: AuthContext, CartContext
  - services: api.js, bookService.js, ...

## 3. Các entity chính và ràng buộc
- User
  - unique(email)
  - password hash
  - role, accountStatus
- Book
  - unique(isbn), unique(title) bổ thêm validation (backend + repository)
  - price >= 0, stockQuantity >=0
  - coverImageUrl
  - relationship category/author/publisher (ManyToOne)
- Category/Author/Publisher
  - name unique
  - thêm imageUrl

## 4. Developer flow CRUD
### Book
1. GET /api/books
2. POST /api/books + body BookDTO
3. PUT /api/books/{id} + body BookDTO
4. DELETE /api/books/{id}
5. Tìm kiếm: /api/books/search?keyword=...
6. Bộ lọc: /api/books/category/{id}, /api/books/author/{id}, new list, bestsellers

### Categories/Authors/Publishers
- GET /api/{resource}
- GET /api/{resource}/{id}
- POST /api/{resource}
- PUT /api/{resource}/{id}
- DELETE /api/{resource}/{id}

## 5. Business rule tránh trùng lặp
- Backend kiểm tra unique
  - CategoryController & AuthorController & PublisherController:
    - existsByNameIgnoreCase
    - nếu trùng: throw ValidationException
- BookService:
    - createBookFromDTO: check title + isbn
    - updateBookFromDTO: check title + isbn trừ chính cuốn

## 6. Frontend tính năng chỉnh sửa + upload ảnh
- AdminCategories/AdminAuthors/AdminPublishers:
    - formData bao gồm `imageUrl`
    - ImageUpload component giúp up ảnh lên Cloudinary
- ImageUpload features:
    - validate file type
    - validate dung lượng <=10MB
    - preview ảnh trước khi up
    - gọi imageService.uploadBookCover/uploadAvatar/uploadImage
- Bảng hiển thị thumbnail image nhỏ
- Toast messages: success/error

## 7. CORS / security
- CORS allow `http://localhost:5173`, `http://localhost:3000`
- JWT filter `JwtAuthenticationFilter`
- SecurityConfig:
  - endpoint public: /api/auth/**, /api/health** và GET books/categories/authors/publishers
  - endpoint admin/user cần role admin

## 8. Sửa dữ liệu SQL, schema và dữ liệu mẫu
- schema.sql chứa cấu trúc và sample data
- users: unique email + role enums
- books: unique isbn + indexes
- relation OK với foreign key ON DELETE SET NULL / CASCADE
- đã thêm unique constraint ở DB cho name và image_url cột

## 9. Build & test
- Backend: `mvn clean test` (tối ưu, test compile + unit tests)
- Frontend: `npm run build` và `npm run dev`
- CVE scan: `appmod-validate-cves-for-java`; fix `mysql-connector-j` lên 8.2.0

## 10. Các câu hỏi phỏng vấn nên chuẩn bị
1. Bạn sẽ làm gì để đảm bảo dữ liệu không trùng lặp khi 2 client gửi cùng lúc?
2. Tại sao cần index trên cột tìm kiếm (title, isbn)?
3. Khi cập nhật Book, bạn xử lý ảnh bìa như nào?
4. Mô tả dòng đời 1 request tạo sách qua toàn stack?
5. Backend nếu trùng tên Category trả lỗi 400 như thế nào?
6. Làm sao tối ưu giao diện Admin khi table > 1000 dòng? (pagination, lazy load)
7. Nếu muốn chuyển từ Cloudinary sang S3 thì cần điều chỉnh những layer nào?
8. Cách fix CVE trong Maven dependency: `appmod-validate-cves-for-java` -> tìm bị lỗi -> upgrade version -> rebuild.

## 11. Ghi chú nhanh
- Mặc định `User` role admin/customer
- `BookController` dùng `BookService`
- `BookRepository` có custom `findByIsbn`, `searchBooks`
- sample data gồm author/publisher/categories/books
- Trong frontend admin forms có validation cơ bản, hiện lỗi cho người dùng.
