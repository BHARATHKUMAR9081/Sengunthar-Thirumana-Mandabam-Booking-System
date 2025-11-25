import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import StripePayment from '../components/StripePayment';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStripePayment, setShowStripePayment] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentType, setPaymentType] = useState('advance');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/bookings/my-bookings');
      if (response.data.success) {
        setBookings(response.data.bookings);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStripePayment = (bookingId, amount, type) => {
    setSelectedBooking(bookingId);
    setPaymentAmount(amount);
    setPaymentType(type);
    setShowStripePayment(true);
  };

  const handlePaymentSuccess = (result) => {
    alert(`Payment of $${result.amountPaid} successful!`);
    setShowStripePayment(false);
    fetchBookings(); // Refresh bookings
  };

  const handlePaymentCancel = () => {
    setShowStripePayment(false);
    setSelectedBooking(null);
  };

  if (loading) {
    return <div style={{ marginTop: '100px', textAlign: 'center' }}>Loading...</div>;
  }

  if (showStripePayment) {
    return (
      <div style={{ marginTop: '100px', padding: '20px' }}>
        <div className="container">
          <button
            onClick={handlePaymentCancel}
            className="btn btn-secondary"
            style={{ marginBottom: '20px' }}
          >
            ← Back to Bookings
          </button>
          
          <StripePayment
            bookingId={selectedBooking}
            amount={paymentAmount}
            paymentType={paymentType}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '100px', padding: '20px' }}>
      <div className="container">
        <h2>My Bookings</h2>
        
        {bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <p>No bookings found.</p>
            <a href="/booking" className="btn">Book Now</a>
          </div>
        ) : (
          <div className="grid">
            {bookings.map((booking) => {
              const remainingAmount = booking.totalAmount - booking.advancePaid;
              
              return (
                <div key={booking._id} className="card">
                  <h3>{booking.eventType} - {new Date(booking.date).toLocaleDateString()}</h3>
                  <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {booking.startTime} to {booking.endTime}</p>
                  <p><strong>Guests:</strong> {booking.guestCount}</p>
                  <p><strong>Total Amount:</strong> ${booking.totalAmount}</p>
                  <p><strong>Advance Paid:</strong> ${booking.advancePaid}</p>
                  <p><strong>Remaining Amount:</strong> ${remainingAmount}</p>
                  <p><strong>Status:</strong> 
                    <span style={{ 
                      color: booking.status === 'confirmed' ? 'green' : 'orange',
                      fontWeight: 'bold',
                      marginLeft: '10px'
                    }}>
                      {booking.status}
                    </span>
                  </p>
                  <p><strong>Payment:</strong> 
                    <span style={{ 
                      color: booking.paymentStatus === 'fully_paid' ? 'green' : 'orange',
                      fontWeight: 'bold',
                      marginLeft: '10px'
                    }}>
                      {booking.paymentStatus?.replace('_', ' ') || 'pending'}
                    </span>
                  </p>

                  {/* Payment Options */}
                  {remainingAmount > 0 && (
                    <div style={{ marginTop: '15px', padding: '15px', background: '#f8f9fa', borderRadius: '5px' }}>
                      <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>Pay Online:</p>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {booking.advancePaid < 1000 && (
                          <button 
                            onClick={() => handleStripePayment(booking._id, 1000, 'advance')}
                            className="btn"
                            style={{ fontSize: '0.8em' }}
                          >
                            Pay $1,000 Advance
                          </button>
                        )}
                        
                        {remainingAmount >= 5000 && (
                          <button 
                            onClick={() => handleStripePayment(booking._id, 5000, 'remaining')}
                            className="btn"
                            style={{ fontSize: '0.8em' }}
                          >
                            Pay $5,000
                          </button>
                        )}
                        
                        <button 
                          onClick={() => handleStripePayment(booking._id, remainingAmount, 'remaining')}
                          className="btn"
                          style={{ fontSize: '0.8em' }}
                        >
                          Pay Full ${remainingAmount}
                        </button>
                      </div>
                      
                      <p style={{ fontSize: '0.8em', color: '#666', marginTop: '10px' }}>
                        Or pay offline at venue
                      </p>
                    </div>
                  )}

                  {booking.specialRequirements && (
                    <p><strong>Special Requirements:</strong> {booking.specialRequirements}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;