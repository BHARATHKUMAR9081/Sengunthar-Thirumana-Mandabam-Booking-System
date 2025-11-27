import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import axios from 'axios';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAdmin();
  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const response = await axios.post("http://localhost:5000/api/admin/login", {
      email,
      password
    });

    if (response.data.success) {
      login(response.data.admin, response.data.token); // MUST HAVE TOKEN
      navigate("/admin/dashboard");
      return;
    }

    setError("Invalid admin credentials");
  } catch (error) {
    console.log("LOGIN ERROR:", error.response?.data || error.message);
    setError("Login failed");
  } finally {
    setLoading(false);
  }
};


  return (
    <div style={{ marginTop: '100px', padding: '20px' }}>
      <div className="container">
        <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
          <h2>Admin Login</h2>
          <p style={{ color: '#666', marginBottom: '30px' }}>Mandabam Owner Portal</p>
          
          {error && (
            <div style={{ 
              background: '#ffebee', 
              color: '#c62828', 
              padding: '10px', 
              borderRadius: '5px',
              marginBottom: '20px'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mandabam.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn" 
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login as Admin'}
            </button>
          </form>
          <p style={{ marginTop: '20px' }}>
            <a href="/" style={{ color: '#007bff' }}>← Back to main site</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;