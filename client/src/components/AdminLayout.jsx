// components/AdminLayout.jsx
import React from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom'; // Add Outlet
import { useAdmin } from '../context/AdminContext';

const AdminLayout = () => {
  const { admin, logout } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      {/* Admin Header */}
      <header style={{
        background: '#2c3e50',
        color: 'white',
        padding: '0 20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto',
          height: '70px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
            <Link to="/admin/dashboard" style={{
              textDecoration: 'none',
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}>
              🏛️ Mandabam Admin
            </Link>
            
            <nav style={{ display: 'flex', gap: '20px' }}>
              <Link 
                to="/admin/dashboard" 
                style={{
                  textDecoration: 'none',
                  color: 'white',
                  padding: '10px 15px',
                  borderRadius: '5px',
                  background: location.pathname === '/admin/dashboard' ? '#34495e' : 'transparent',
                  transition: 'background 0.3s'
                }}
              >
                📊 Dashboard
              </Link>
              <Link 
                to="/admin/bookings" 
                style={{
                  textDecoration: 'none',
                  color: 'white',
                  padding: '10px 15px',
                  borderRadius: '5px',
                  background: location.pathname === '/admin/bookings' ? '#34495e' : 'transparent',
                  transition: 'background 0.3s'
                }}
              >
                📅 Bookings
              </Link>
              <Link 
                to="/admin/payments" 
                style={{
                  textDecoration: 'none',
                  color: 'white',
                  padding: '10px 15px',
                  borderRadius: '5px',
                  background: location.pathname === '/admin/payments' ? '#34495e' : 'transparent',
                  transition: 'background 0.3s'
                }}
              >
                💰 Payments
              </Link>
            </nav>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span>Welcome, {admin?.name}</span>
            <button 
              onClick={handleLogout}
              style={{
                background: '#e74c3c',
                color: 'white',
                border: 'none',
                padding: '8px 15px',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Use Outlet for nested routes */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '30px 20px',
        minHeight: 'calc(100vh - 70px)'
      }}>
        <Outlet /> {/* This renders the nested route components */}
      </main>
    </div>
  );
};

export default AdminLayout;