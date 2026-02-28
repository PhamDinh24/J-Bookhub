# J-Bookhub - Hệ Thống Bán Sách Trực Tuyến
## Tài Liệu Yêu Cầu (Requirements)

**Phiên bản:** 1.0.0  
**Ngày cập nhật:** 28/02/2026  
**Trạng thái:** Hoàn thành phân tích

---

## 1. Tổng Quan Hệ Thống

### 1.1 Mô Tả Chung
J-Bookhub là một nền tảng thương mại điện tử chuyên biệt cho bán sách trực tuyến, cung cấp trải nghiệm mua sắm thông minh cho khách hàng và công cụ quản lý toàn diện cho nhà quản trị.

### 1.2 Mục Tiêu Chính
- Cung cấp trải nghiệm tìm kiếm và mua sắm sách dễ dàng, thông minh
- Hỗ trợ thanh toán điện tử an toàn thông qua VNPay
- Cung cấp công cụ quản lý và báo cáo toàn diện cho quản trị viên
- Theo dõi đơn hàng và quản lý kho hàng tự động

---

## 2. Phân Hệ Người Dùng (Client)

### 2.1 Tìm Kiếm và Lọc Thông Minh

#### 2.1.1 Bộ Lọc Đa Tiêu Chí
**User Story:**
- Là một khách hàng, tôi muốn lọc sách theo nhiều tiêu chí để tìm được sách phù hợp nhanh chóng

**Acceptance Criteria:**
- [ ] Có thể lọc theo tác giả
- [ ] Có thể lọc theo nhà xuất bản
- [ ] Có thể lọc theo khoảng giá (dưới 50k, 50-100k, 100-200k, trên 200k)
- [ ] Có thể lọc theo đánh giá (1-5 sao)
- [ ] Có thể lọc theo tình trạng kho (còn hàng/hết hàng)
- [ ] Có thể kết hợp nhiều bộ lọc cùng lúc
- [ ] Kết quả lọc cập nhật tức thời
- [ ] Có nút "Xóa bộ lọc" để reset

#### 2.1.2 Chức Năng Tìm Kiếm
**User Story:**
- Là một khách hàng, tôi muốn tìm kiếm sách theo tên để nhanh chóng tìm được sách mình cần

**Acceptance Criteria:**
- [ ] Tìm kiếm theo tên sách
- [ ] Tìm kiếm không phân biệt hoa/thường
- [ ] Hiển thị số lượng kết quả tìm kiếm
- [ ] Tìm kiếm có debounce để tránh quá tải server
- [ ] Có gợi ý tìm kiếm (autocomplete)

#### 2.1.3 Gợi Ý Sách Tự Động
**User Story:**
- Là một khách hàng, tôi muốn nhận được gợi ý sách dựa trên hành vi xem/mua của tôi

**Acceptance Criteria:**
- [ ] Hệ thống ghi nhận sách đã xem
- [ ] Hệ thống ghi nhận sách đã mua
- [ ] Hiển thị "Sách tương tự" dựa trên danh mục
- [ ] Hiển thị "Sách được mua cùng" dựa trên đơn hàng khác
- [ ] Hiển thị "Sách bán chạy" trong danh mục
- [ ] Gợi ý cập nhật theo thời gian thực

### 2.2 Thanh Toán Điện Tử

#### 2.2.1 Tích Hợp VNPay
**User Story:**
- Là một khách hàng, tôi muốn thanh toán trực tuyến an toàn thông qua VNPay

**Acceptance Criteria:**
- [ ] Có tùy chọn thanh toán VNPay tại checkout
- [ ] Được chuyển hướng đến cổng VNPay
- [ ] Xử lý giao dịch thời gian thực
- [ ] Nhận xác nhận thanh toán từ VNPay
- [ ] Cập nhật trạng thái đơn hàng sau thanh toán thành công
- [ ] Xử lý lỗi thanh toán một cách graceful
- [ ] Lưu lịch sử giao dịch

#### 2.2.2 Thanh Toán COD (Truyền Thống)
**User Story:**
- Là một khách hàng, tôi muốn thanh toán khi nhận hàng (COD)

**Acceptance Criteria:**
- [ ] Có tùy chọn COD tại checkout
- [ ] Đơn hàng được tạo với trạng thái "Chờ xử lý"
- [ ] Không cần chuyển hướng đến cổng thanh toán
- [ ] Có thể hủy đơn hàng trước khi giao

### 2.3 Quản Lý Đơn Hàng Cá Nhân

#### 2.3.1 Theo Dõi Đơn Hàng
**User Story:**
- Là một khách hàng, tôi muốn theo dõi trạng thái đơn hàng của tôi theo thời gian thực

**Acceptance Criteria:**
- [ ] Có trang "Lịch sử đơn hàng" hiển thị tất cả đơn hàng
- [ ] Mỗi đơn hàng hiển thị: ID, ngày đặt, tổng tiền, trạng thái
- [ ] Có thể xem chi tiết từng đơn hàng
- [ ] Chi tiết đơn hàng hiển thị: sách, số lượng, giá, địa chỉ giao hàng
- [ ] Trạng thái đơn hàng cập nhật tức thời (pending → processing → shipped → delivered)
- [ ] Có thể hủy đơn hàng nếu chưa giao
- [ ] Có thể xem lịch sử thanh toán

#### 2.3.2 Quản Lý Giỏ Hàng
**User Story:**
- Là một khách hàng, tôi muốn quản lý giỏ hàng của tôi trước khi thanh toán

**Acceptance Criteria:**
- [ ] Có thể thêm sách vào giỏ hàng
- [ ] Có thể xóa sách khỏi giỏ hàng
- [ ] Có thể thay đổi số lượng sách
- [ ] Giỏ hàng lưu trữ trong localStorage
- [ ] Hiển thị tổng tiền giỏ hàng
- [ ] Hiển thị số lượng sách trong giỏ (badge)
- [ ] Có thể xóa toàn bộ giỏ hàng

#### 2.3.3 Quản Lý Tài Khoản
**User Story:**
- Là một khách hàng, tôi muốn quản lý thông tin tài khoản của tôi

**Acceptance Criteria:**
- [ ] Có thể xem thông tin cá nhân
- [ ] Có thể cập nhật họ tên, số điện thoại, địa chỉ
- [ ] Có thể thay đổi mật khẩu
- [ ] Có thể tải lên ảnh đại diện
- [ ] Có thể xem lịch sử đơn hàng
- [ ] Có thể xem lịch sử thanh toán

---

## 3. Phân Hệ Quản Trị (Admin)

### 3.1 Quản Lý Danh Mục và Kho Hàng

#### 3.1.1 Quản Lý Sách
**User Story:**
- Là một quản trị viên, tôi muốn quản lý vòng đời sản phẩm sách

**Acceptance Criteria:**
- [ ] Có thể thêm sách mới (tiêu đề, tác giả, NXB, giá, mô tả, ảnh bìa)
- [ ] Có thể chỉnh sửa thông tin sách
- [ ] Có thể xóa sách
- [ ] Có thể xem danh sách tất cả sách
- [ ] Có thể tìm kiếm sách theo tên
- [ ] Có thể lọc sách theo danh mục, tác giả, NXB
- [ ] Có thể sắp xếp sách theo tên, giá, ngày thêm

#### 3.1.2 Quản Lý Kho Hàng
**User Story:**
- Là một quản trị viên, tôi muốn quản lý số lượng tồn kho

**Acceptance Criteria:**
- [ ] Có thể xem số lượng tồn kho của mỗi sách
- [ ] Có thể cập nhật số lượng tồn kho
- [ ] Số lượng tồn kho tự động giảm khi có đơn hàng
- [ ] Có cảnh báo khi số lượng tồn kho dưới ngưỡng
- [ ] Có thể xem lịch sử thay đổi kho hàng
- [ ] Có thể xuất báo cáo kho hàng

#### 3.1.3 Quản Lý Danh Mục
**User Story:**
- Là một quản trị viên, tôi muốn quản lý danh mục sách

**Acceptance Criteria:**
- [ ] Có thể thêm danh mục mới
- [ ] Có thể chỉnh sửa danh mục
- [ ] Có thể xóa danh mục
- [ ] Có thể xem danh sách danh mục
- [ ] Mỗi sách phải thuộc một danh mục

#### 3.1.4 Quản Lý Tác Giả và NXB
**User Story:**
- Là một quản trị viên, tôi muốn quản lý thông tin tác giả và nhà xuất bản

**Acceptance Criteria:**
- [ ] Có thể thêm tác giả mới (tên, tiểu sử)
- [ ] Có thể chỉnh sửa thông tin tác giả
- [ ] Có thể xóa tác giả
- [ ] Có thể thêm NXB mới (tên, thông tin liên hệ)
- [ ] Có thể chỉnh sửa thông tin NXB
- [ ] Có thể xóa NXB

### 3.2 Hệ Thống Báo Cáo và Thống Kê

#### 3.2.1 Thống Kê Doanh Thu
**User Story:**
- Là một quản trị viên, tôi muốn xem thống kê doanh thu theo thời gian

**Acceptance Criteria:**
- [ ] Có thể xem doanh thu theo ngày
- [ ] Có thể xem doanh thu theo tuần
- [ ] Có thể xem doanh thu theo tháng
- [ ] Có thể xem doanh thu theo quý
- [ ] Có thể xem doanh thu theo năm
- [ ] Có biểu đồ so sánh tăng trưởng doanh thu
- [ ] Có thể lọc theo khoảng thời gian tùy chỉnh
- [ ] Hiển thị tổng doanh thu, doanh thu trung bình, doanh thu cao nhất

#### 3.2.2 Báo Cáo Sách Bán Chạy
**User Story:**
- Là một quản trị viên, tôi muốn xem báo cáo sách bán chạy nhất

**Acceptance Criteria:**
- [ ] Có thể xem top 10 sách bán chạy nhất
- [ ] Hiển thị: tên sách, số lượng bán, doanh thu
- [ ] Có thể lọc theo khoảng thời gian
- [ ] Có thể lọc theo danh mục
- [ ] Có biểu đồ so sánh
- [ ] Có thể xuất báo cáo

#### 3.2.3 Báo Cáo Kho Hàng
**User Story:**
- Là một quản trị viên, tôi muốn xem báo cáo sách tồn kho lâu ngày

**Acceptance Criteria:**
- [ ] Có thể xem sách tồn kho lâu ngày (chưa bán)
- [ ] Hiển thị: tên sách, số lượng tồn, ngày thêm, giá
- [ ] Có thể lọc theo khoảng thời gian
- [ ] Có thể lọc theo danh mục
- [ ] Có gợi ý chiến lược kinh doanh (giảm giá, khuyến mãi)
- [ ] Có thể xuất báo cáo

#### 3.2.4 Báo Cáo Đơn Hàng
**User Story:**
- Là một quản trị viên, tôi muốn xem báo cáo đơn hàng

**Acceptance Criteria:**
- [ ] Có thể xem tổng số đơn hàng
- [ ] Có thể xem số đơn hàng theo trạng thái (pending, processing, shipped, delivered)
- [ ] Có thể xem giá trị trung bình đơn hàng
- [ ] Có thể lọc theo khoảng thời gian
- [ ] Có biểu đồ so sánh
- [ ] Có thể xuất báo cáo

#### 3.2.5 Xuất Báo Cáo
**User Story:**
- Là một quản trị viên, tôi muốn xuất báo cáo dưới các định dạng khác nhau

**Acceptance Criteria:**
- [ ] Có thể xuất báo cáo dưới dạng Excel
- [ ] Có thể xuất báo cáo dưới dạng Word
- [ ] Có thể xuất báo cáo dưới dạng CSV
- [ ] Báo cáo bao gồm tiêu đề, ngày xuất, dữ liệu chi tiết
- [ ] Có thể tùy chỉnh cột dữ liệu

### 3.3 Quản Lý Người Dùng

#### 3.3.1 Quản Lý Tài Khoản Khách Hàng
**User Story:**
- Là một quản trị viên, tôi muốn quản lý tài khoản khách hàng

**Acceptance Criteria:**
- [ ] Có thể xem danh sách tất cả khách hàng
- [ ] Có thể xem thông tin chi tiết khách hàng
- [ ] Có thể khóa/mở khóa tài khoản khách hàng
- [ ] Có thể xem lịch sử đơn hàng của khách hàng
- [ ] Có thể xem lịch sử thanh toán của khách hàng
- [ ] Có thể tìm kiếm khách hàng theo email, tên

### 3.4 Quản Lý Đơn Hàng

#### 3.4.1 Quản Lý Trạng Thái Đơn Hàng
**User Story:**
- Là một quản trị viên, tôi muốn quản lý trạng thái đơn hàng

**Acceptance Criteria:**
- [ ] Có thể xem danh sách tất cả đơn hàng
- [ ] Có thể xem chi tiết đơn hàng
- [ ] Có thể cập nhật trạng thái đơn hàng (pending → processing → shipped → delivered)
- [ ] Có thể hủy đơn hàng
- [ ] Có thể xem lịch sử thay đổi trạng thái
- [ ] Có thể tìm kiếm đơn hàng theo ID, khách hàng

### 3.5 Quản Lý Thanh Toán

#### 3.5.1 Quản Lý Giao Dịch
**User Story:**
- Là một quản trị viên, tôi muốn quản lý giao dịch thanh toán

**Acceptance Criteria:**
- [ ] Có thể xem danh sách tất cả giao dịch
- [ ] Có thể xem chi tiết giao dịch (ID, số tiền, phương thức, trạng thái)
- [ ] Có thể lọc giao dịch theo phương thức (VNPay, COD)
- [ ] Có thể lọc giao dịch theo trạng thái (pending, completed, failed)
- [ ] Có thể xem lịch sử giao dịch

### 3.6 Quản Lý Đánh Giá

#### 3.6.1 Quản Lý Bình Luận và Đánh Giá
**User Story:**
- Là một quản trị viên, tôi muốn quản lý đánh giá và bình luận

**Acceptance Criteria:**
- [ ] Có thể xem danh sách tất cả đánh giá
- [ ] Có thể xem chi tiết đánh giá (sách, khách hàng, rating, bình luận)
- [ ] Có thể xóa đánh giá không phù hợp
- [ ] Có thể lọc đánh giá theo rating
- [ ] Có thể lọc đánh giá theo sách

---

## 4. Yêu Cầu Phi Chức Năng

### 4.1 Hiệu Năng
- [ ] Trang chủ tải trong < 2 giây
- [ ] Danh sách sách tải trong < 3 giây
- [ ] Thanh toán xử lý trong < 5 giây
- [ ] Hỗ trợ tối thiểu 1000 người dùng đồng thời

### 4.2 Bảo Mật
- [ ] Mật khẩu được mã hóa bằng BCrypt
- [ ] Token JWT được sử dụng cho xác thực
- [ ] HTTPS được sử dụng cho tất cả giao dịch
- [ ] Dữ liệu thanh toán được bảo vệ
- [ ] CORS được cấu hình đúng

### 4.3 Khả Dụng
- [ ] Hệ thống hoạt động 24/7
- [ ] Thời gian downtime < 1% mỗi tháng
- [ ] Có backup dữ liệu hàng ngày

### 4.4 Khả Mở Rộng
- [ ] Kiến trúc cho phép thêm tính năng mới
- [ ] Cơ sở dữ liệu có thể mở rộng
- [ ] API có thể hỗ trợ nhiều client

### 4.5 Tương Thích
- [ ] Hỗ trợ Chrome, Firefox, Safari, Edge
- [ ] Hỗ trợ iOS, Android
- [ ] Responsive design cho tất cả kích thước màn hình

---

## 5. Ràng Buộc và Giả Định

### 5.1 Ràng Buộc
- Sử dụng Spring Boot cho backend
- Sử dụng React cho frontend
- Sử dụng MySQL cho cơ sở dữ liệu
- Sử dụng VNPay cho thanh toán

### 5.2 Giả Định
- Người dùng có kết nối internet ổn định
- Người dùng sử dụng trình duyệt hiện đại
- VNPay API luôn khả dụng

---

## 6. Tiêu Chí Chấp Nhận

Hệ thống được coi là hoàn thành khi:
- [ ] Tất cả user story được triển khai
- [ ] Tất cả acceptance criteria được đáp ứng
- [ ] Tất cả test case đều pass
- [ ] Không có bug critical
- [ ] Hiệu năng đáp ứng yêu cầu
- [ ] Bảo mật được xác minh

---

## 7. Lộ Trình Phát Triển

### Phase 1: MVP (Hoàn thành)
- Xác thực người dùng
- Danh sách sách và tìm kiếm
- Giỏ hàng
- Thanh toán COD
- Quản lý đơn hàng cơ bản

### Phase 2: Thanh Toán Điện Tử (Hoàn thành)
- Tích hợp VNPay
- Xử lý giao dịch
- Báo cáo thanh toán

### Phase 3: Báo Cáo và Thống Kê (Hoàn thành)
- Thống kê doanh thu
- Báo cáo sách bán chạy
- Báo cáo kho hàng
- Xuất báo cáo

### Phase 4: Tối Ưu Hóa (Đang thực hiện)
- Gợi ý sách thông minh
- Tối ưu hiệu năng
- Cải thiện UX/UI

---

## 8. Danh Sách Từ Vựng

| Thuật ngữ | Định nghĩa |
|-----------|-----------|
| VNPay | Cổng thanh toán trực tuyến Việt Nam |
| COD | Thanh toán khi nhận hàng (Cash on Delivery) |
| JWT | JSON Web Token - chuẩn xác thực |
| API | Application Programming Interface |
| CORS | Cross-Origin Resource Sharing |
| Sandbox | Môi trường thử nghiệm |
| Responsive | Thích ứng với kích thước màn hình |

---

**Tài liệu này được cập nhật lần cuối vào 28/02/2026**
