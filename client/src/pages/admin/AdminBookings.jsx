import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get('http://localhost:5000/api/bookings');
      
      // Handle the new API response structure
      if (response.data.success && Array.isArray(response.data.bookings)) {
        setBookings(response.data.bookings);
      } else {
        setError('No bookings found');
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await axios.put(`http://localhost:5000/api/bookings/${bookingId}/cancel`, {
          reason: 'Cancelled by admin'
        });
        alert('Booking cancelled successfully');
        fetchBookings();
      } catch (error) {
        alert('Failed to cancel booking: ' + (error.response?.data?.message || 'Please try again'));
      }
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/bookings/${bookingId}/status`, {
        status: newStatus
      });
      alert('Booking status updated');
      fetchBookings();
    } catch (error) {
      alert('Failed to update status: ' + (error.response?.data?.message || 'Please try again'));
    }
  };

  if (loading) return <div>Loading bookings...</div>;

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ color: '#d32f2f', marginBottom: '20px' }}>{error}</div>
        <button onClick={fetchBookings} className="btn">Try Again</button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Bookings Management</h1>
        <button onClick={fetchBookings} className="btn">Refresh</button>
      </div>

      {/* Rest of the component remains the same but uses the corrected bookings array */}
      <div style={{ background: 'white', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Booking ID</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Customer</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Date & Time</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Amount</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking._id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>#{booking._id?.slice(-6)}</td>
                <td style={{ padding: '12px' }}>
                  <strong>{booking.user?.name}</strong>
                  <div style={{ fontSize: '0.9em', color: '#666' }}>{booking.user?.phone}</div>
                </td>
                <td style={{ padding: '12px' }}>
                  <strong>{new Date(booking.date).toLocaleDateString('en-IN')}</strong>
                  <div style={{ fontSize: '0.9em', color: '#666' }}>{booking.startTime} - {booking.endTime}</div>
                </td>
                <td style={{ padding: '12px' }}>
                  <strong>₹{booking.totalAmount}</strong>
                  <div style={{ fontSize: '0.9em', color: '#666' }}>Adv: ₹{booking.advancePaid}</div>
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.8em', fontWeight: 'bold',
                    background: booking.status === 'confirmed' ? '#e8f5e8' : 
                              booking.status === 'pending' ? '#fff3cd' : '#ffebee',
                    color: booking.status === 'confirmed' ? '#2e7d32' : 
                          booking.status === 'pending' ? '#856404' : '#c62828'
                  }}>
                    {booking.status}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  {booking.status !== 'cancelled' && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                        className="btn"
                        style={{ padding: '6px 12px', fontSize: '0.8em' }}
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.8em' }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminBookings;