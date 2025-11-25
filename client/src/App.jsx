// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext'; // Add this
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Booking from './pages/Booking';
import Gallery from './pages/Gallery';
import MyBookings from './pages/MyBookings';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin'; // Add this import
import AdminBookings from './pages/admin/AdminBookings'; // Add this import
import AdminPayments from './pages/admin/AdminPayments'; // Add this import
import AdminLayout from './components/AdminLayout'; // Add this import
import PaymentSuccess from './pages/PaymentSuccess';
import './index.css';

function App() {
  return (
    <Router future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }}>
      <AuthProvider>
        <AdminProvider> {/* Add AdminProvider */}
          <div className="App">
            <Navbar />
            <main style={{ minHeight: 'calc(100vh - 80px)' }}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/booking" element={<Booking />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/my-bookings" element={<MyBookings />} />
                
                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                
                {/* Protected Admin Routes with Layout */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="bookings" element={<AdminBookings />} />
                  <Route path="payments" element={<AdminPayments />} />
                </Route>
                <Route path="/payment-success" element={<PaymentSuccess />} />
                {/* Fallback route */}
                <Route path="*" element={<Home />} />
              </Routes>
            </main>
          </div>
        </AdminProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;