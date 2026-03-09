# J-Bookhub - Online Bookstore Platform

A full-stack e-commerce platform for buying and selling books online. Built with Spring Boot backend and React frontend.

## 📋 Project Overview

J-Bookhub is a modern online bookstore application that allows users to:
- Browse and search for books
- Add books to cart and checkout
- Place orders and track delivery
- Leave reviews and ratings
- Manage user profiles

Administrators can:
- Manage books, categories, authors, and publishers
- Track orders and payments
- View sales reports and analytics
- Manage user accounts

## 🏗️ Project Structure

```
J-Bookhub/
├── backend/                          # Spring Boot REST API
│   ├── src/main/java/com/bookstore/
│   │   ├── config/                  # Security & JWT configuration
│   │   ├── controller/              # REST endpoints
│   │   ├── dto/                     # Data Transfer Objects
│   │   ├── exception/               # Custom exceptions & handlers
│   │   ├── model/                   # JPA entities
│   │   ├── repository/              # Data access layer
│   │   ├── service/                 # Business logic
│   │   └── util/                    # Utilities & constants
│   ├── src/main/resources/
│   │   ├── application.properties   # Configuration
│   │   └── schema.sql               # Database schema
│   └── pom.xml                      # Maven dependencies
│
├── frontend/                         # React SPA
│   ├── src/
│   │   ├── components/              # Reusable React components
│   │   ├── context/                 # React Context (Auth, Cart)
│   │   ├── pages/                   # Page components
│   │   ├── services/                # API client services
│   │   ├── styles/                  # CSS stylesheets
│   │   ├── utils/                   # Utility functions
│   │   ├── App.jsx                  # Main app component
│   │   └── main.jsx                 # Entry point
│   ├── package.json                 # NPM dependencies
│   └── vite.config.js               # Vite configuration
│
└── README.md                         # This file
```

## 🛠️ Tech Stack

### Backend
- **Framework**: Spring Boot 3.2.0
- **Language**: Java 17
- **Database**: MySQL 8.0
- **Authentication**: JWT (JSON Web Tokens)
- **ORM**: JPA/Hibernate
- **Build Tool**: Maven 3.9.6

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Styling**: CSS3
- **State Management**: React Context API

### External Services
- **Payment Gateway**: VNPay (Vietnamese payment)
- **Image Storage**: Cloudinary

## 📦 Installation & Setup

### Prerequisites
- Java 17+
- Node.js 16+
- MySQL 8.0+
- Maven 3.9.6

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Configure database** (edit `.env.local`)
   ```
   DB_URL=jdbc:mysql://localhost:3306/J-Bookhub
   DB_USERNAME=root
   DB_PASSWORD=your_password
   ```

3. **Build the project**
   ```bash
   mvn clean package -DskipTests
   ```

4. **Run the backend**
   ```bash
   java -jar target/bookstore-api-1.0.0.jar
   ```
   Backend runs on `http://localhost:8080`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

## 🔑 Key Features

### User Features
- ✅ User registration and authentication
- ✅ Browse books by category
- ✅ Search and filter books
- ✅ Shopping cart management
- ✅ Secure checkout with VNPay payment
- ✅ Order history and tracking
- ✅ Product reviews and ratings
- ✅ User profile management

### Admin Features
- ✅ Dashboard with statistics
- ✅ Book management (CRUD)
- ✅ Category, Author, Publisher management
- ✅ Order management and status tracking
- ✅ User account management (lock/unlock)
- ✅ Payment tracking
- ✅ Sales reports and analytics
- ✅ Review moderation

### Stock & Revenue Management
- ✅ Stock reduced only when order is delivered
- ✅ Revenue calculated from delivered orders only
- ✅ Automatic stock restoration on order cancellation
- ✅ Payment status updates on delivery

## 🔐 Security Features

- JWT-based authentication
- Password hashing with BCrypt
- CORS configuration
- Role-based access control (Admin/Customer)
- Protected API endpoints
- Account status management (active/inactive/suspended)

## 📊 Database Schema

### Main Tables
- **users** - User accounts and profiles
- **books** - Book catalog
- **categories** - Book categories
- **authors** - Book authors
- **publishers** - Book publishers
- **orders** - Customer orders
- **order_details** - Order line items
- **payments** - Payment records
- **reviews** - Product reviews
- **carts** - Shopping carts
- **cart_items** - Cart line items

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Books
- `GET /api/books` - Get all books
- `GET /api/books/{id}` - Get book details
- `POST /api/books` - Create book (Admin)
- `PUT /api/books/{id}` - Update book (Admin)
- `DELETE /api/books/{id}` - Delete book (Admin)

### Orders
- `GET /api/orders` - Get all orders (Admin)
- `GET /api/orders/user/{userId}` - Get user orders
- `POST /api/orders` - Create order
- `PUT /api/orders/{id}` - Update order status
- `GET /api/orders/{id}/details` - Get order details

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/{id}` - Get user details
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user (Admin)

### Admin
- `GET /api/admin/dashboard/statistics` - Dashboard stats
- `GET /api/admin/reports` - Sales reports

## 🔄 Order Delivery Workflow

1. **Order Created** - Status: `pending`, Stock unchanged
2. **Order Processing** - Status: `processing`
3. **Order Shipped** - Status: `shipped`
4. **Order Delivered** - Status: `delivered`
   - Stock is reduced
   - Revenue is counted
   - Payment status updates to `completed`
   - Delivery timestamp is recorded

## 📝 Configuration

### Backend Configuration (`application.properties`)
```properties
server.port=8080
spring.datasource.url=jdbc:mysql://localhost:3306/J-Bookhub
spring.jpa.hibernate.ddl-auto=update
jwt.expiration=600000
```

### Frontend Configuration (`vite.config.js`)
```javascript
export default {
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8080'
    }
  }
}
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
mvn test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1920px and above)
- Tablet (768px - 1024px)
- Mobile (320px - 767px)

## 🌐 Supported Languages

- Vietnamese (Tiếng Việt)
- English (partial)

## 📄 Environment Variables

### Backend (.env.local)
```
DB_URL=jdbc:mysql://localhost:3306/J-Bookhub
DB_USERNAME=root
DB_PASSWORD=120224
JWT_SECRET=your-secret-key
VNPAY_TMN_CODE=your_code
VNPAY_HASH_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

## 🐛 Troubleshooting

### Port 8080 Already in Use
```bash
# Kill process using port 8080
lsof -ti:8080 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :8080   # Windows
```

### Database Connection Error
- Verify MySQL is running
- Check database credentials in `.env.local`
- Ensure database `J-Bookhub` exists

### Frontend API Errors
- Verify backend is running on port 8080
- Check CORS configuration in `SecurityConfig.java`
- Clear browser cache and cookies

## 📚 Documentation

- [Backend API Documentation](./backend/README.md)
- [Frontend Setup Guide](./frontend/README.md)
- [Database Schema](./backend/src/main/resources/schema.sql)

## 👥 Team

- Backend Developer: Java/Spring Boot
- Frontend Developer: React/Vite
- Database Administrator: MySQL

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit changes (`git commit -m 'Add AmazingFeature'`)
3. Push to branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

## 📞 Support

For issues and questions, please create an issue in the repository.

## 🎯 Future Enhancements

- [ ] Email notifications for orders
- [ ] Wishlist feature
- [ ] Book recommendations
- [ ] Advanced search filters
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Social sharing features
- [ ] Loyalty program

---

**Last Updated**: March 3, 2026
**Version**: 1.0.0
