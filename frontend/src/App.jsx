import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import {AuthProvider} from './context/AuthContext'
import {CartProvider} from './context/CartContext'
import {ToastProvider} from './components/Toast'
import Header from './components/Header'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import BookList from './pages/BookList'
import BookDetail from './pages/BookDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import OrderHistory from './pages/OrderHistory'
import Profile from './pages/Profile'
import AdminLayout from './pages/Admin/AdminLayout'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentFailure from './pages/PaymentFailure'
import HealthCheck from './pages/HealthCheck'
import NotFound from './pages/NotFound'
import './App.css'

function App() {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AuthProvider>
                <CartProvider>
                    <ToastProvider />
                    <div className="app">
                        <Header/>
                        <Routes>
                            <Route path="/" element={<Home/>}/>
                            <Route path="/books" element={<BookList/>}/>
                            <Route path="/books/:id" element={<BookDetail/>}/>
                            <Route path="/cart" element={<Cart/>}/>
                            <Route path="/checkout" element={<Checkout/>}/>
                            <Route path="/orders" element={<OrderHistory/>}/>
                            <Route path="/profile" element={<Profile/>}/>
                            <Route path="/login" element={<Login/>}/>
                            <Route path="/signup" element={<Signup/>}/>
                            <Route path="/admin" element={
                                <ProtectedRoute requiredRole="admin">
                                    <AdminLayout/>
                                </ProtectedRoute>
                            }/>
                            <Route path="/payment-success" element={<PaymentSuccess/>}/>
                            <Route path="/payment-failure" element={<PaymentFailure/>}/>
                            <Route path="/health" element={<HealthCheck/>}/>
                            <Route path="*" element={<NotFound/>}/>
                        </Routes>
                        <Footer/>
                    </div>
                </CartProvider>
            </AuthProvider>
        </Router>
    )
}

export default App
