import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';


const Booking = () => {
  const [view, setView] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState('');
  const [bookedDates, setBookedDates] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(true);

  // Form states
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('18:00');
  const [eventType, setEventType] = useState('wedding');
  const [guestCount, setGuestCount] = useState(100);
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState(1000);
  const [message, setMessage] = useState('');
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return; // ⛔ Don't redirect while AuthContext is still checking localStorage

    if (!user) {
      navigate('/login');
    } else {
      fetchBookedDates();
    }
}, [user, loading, navigate]);

  // ✔ FIXED: calendarLoading gets turned OFF
  const fetchBookedDates = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/bookings/booked-dates');
      if (response.data.success) {
        setBookedDates(response.data.bookedDates);
      }
    } catch (error) {
      console.log('Error fetching booked dates:', error);
      setBookedDates([]);
    } finally {
      setCalendarLoading(false); // IMPORTANT FIX
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const bookingData = {
        date: selectedDate,
        startTime,
        endTime,
        eventType,
        guestCount: parseInt(guestCount),
        specialRequirements,
        advanceAmount: parseInt(advanceAmount)
      };

      const response = await axios.post('http://localhost:5000/api/bookings', bookingData);

      if (response.data.success) {
        const remainingAmount = 20000 - advanceAmount;
        setMessage(`✅ Booking created! Please pay ₹${advanceAmount} to confirm.`);

        setTimeout(() => {
          setBookedDates(prev => [...prev, selectedDate]);
          setView('calendar');
          setMessage('');
          navigate('/my-bookings');
        }, 2000);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Booking failed. Please try again.';
      setMessage(`❌ ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDateSelect = (dateStr) => {
    if (!bookedDates.includes(dateStr)) {
      setSelectedDate(dateStr);
      setView('form');
    }
  };

  // Generate 60 days
  const generateCalendarDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 60; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const calendarDates = generateCalendarDates();
  const totalAmount = 20000;
  const remainingAmount = totalAmount - advanceAmount;

  // =======================
  //  FORM VIEW
  // =======================
  if (view === 'form') {
    return (
      <div style={{ marginTop: '100px', padding: '20px' }}>
        <div className="container">
          <button
            onClick={() => {
              setView('calendar');
              setMessage('');
            }}
            className="btn btn-secondary"
            style={{ marginBottom: '20px' }}
          >
            ← Back to Calendar
          </button>

          <h2>Book for {selectedDate}</h2>
          <p style={{ color: '#666', marginBottom: '30px' }}>
            Complete your booking for{' '}
            {new Date(selectedDate).toLocaleDateString('en-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>

          {message && (
            <div
              style={{
                background: message.includes('✅') ? '#e8f5e8' : '#ffebee',
                color: message.includes('✅') ? '#2e7d32' : '#c62828',
                padding: '15px',
                borderRadius: '5px',
                marginBottom: '20px',
                textAlign: 'center'
              }}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleBooking} style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="form-group">
              <label>Event Type</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                required
              >
                <option value="wedding">Wedding</option>
                <option value="birthday">Birthday</option>
                <option value="reception">Reception</option>
                <option value="corporate">Corporate Event</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Number of Guests</label>
              <input
                type="number"
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                min="50"
                max="500"
                required
              />
            </div>

            <div className="form-group">
              <label>Start Time (Today)</label>
              <select value={startTime} onChange={(e) => setStartTime(e.target.value)} required>
                <option value="18:00">6:00 PM</option>
                <option value="19:00">7:00 PM</option>
                <option value="20:00">8:00 PM</option>
                <option value="21:00">9:00 PM</option>
              </select>
            </div>

            <div className="form-group">
              <label>End Time (Tomorrow)</label>
              <select value={endTime} onChange={(e) => setEndTime(e.target.value)} required>
                <option value="18:00">6:00 PM</option>
                <option value="17:00">5:00 PM</option>
                <option value="16:00">4:00 PM</option>
              </select>
            </div>

            <div className="form-group">
              <label>Advance Payment (Minimum ₹1000)</label>
              <input
                type="number"
                value={advanceAmount}
                onChange={(e) => setAdvanceAmount(e.target.value)}
                min="1000"
                max="20000"
                step="500"
                required
              />
              <small style={{ color: '#666' }}>
                Pay at least ₹1000 to confirm your booking. Remaining amount can be paid later.
              </small>
            </div>

            <div className="form-group">
              <label>Special Requirements (Optional)</label>
              <textarea
                value={specialRequirements}
                onChange={(e) => setSpecialRequirements(e.target.value)}
                rows="3"
                placeholder="Any special arrangements..."
              />
            </div>

            <div className="booking-summary">
              <h3>Booking Summary</h3>
              <div className="summary-item">
                <span>Total Package Amount:</span>
                <span>₹20,000</span>
              </div>
              <div className="summary-item">
                <span>Advance Payment:</span>
                <span>₹{advanceAmount}</span>
              </div>
              <div className="summary-total">
                <span>Remaining Amount:</span>
                <span>₹{remainingAmount}</span>
              </div>
            </div>

            <button
              type="submit"
              className="btn"
              style={{ width: '100%', marginTop: '20px' }}
              disabled={submitting}
            >
              {loading ? 'Processing...' : `Pay ₹${advanceAmount} Advance & Confirm Booking`}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // =======================
  //  CALENDAR VIEW
  // =======================
  return (
    <div style={{ marginTop: '100px', padding: '20px' }}>
      <div className="container">
        <h2>Select Date for Booking</h2>
        <p style={{ textAlign: 'center', marginBottom: '30px', color: '#666' }}>
          Choose an available date. Total: ₹20,000 (Minimum ₹1000 advance)
        </p>

        {calendarLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading availability calendar...</div>
        ) : (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '15px',
                maxWidth: '1000px',
                margin: '0 auto'
              }}
            >
              {calendarDates.map((date) => {
                const dateStr = date.toISOString().split('T')[0];
                const isBooked = bookedDates.includes(dateStr);
                const isToday = dateStr === new Date().toISOString().split('T')[0];
                const isAvailable = !isBooked;

                const getStatusColor = () => (isAvailable ? '#4caf50' : '#f44336');
                const getStatusText = () => (isAvailable ? 'Available' : 'Booked');

                return (
                  <div
                    key={dateStr}
                    onClick={() => handleDateSelect(dateStr)}
                    style={{
                      padding: '20px',
                      border: `2px solid ${getStatusColor()}`,
                      borderRadius: '10px',
                      textAlign: 'center',
                      cursor: isAvailable ? 'pointer' : 'not-allowed',
                      background: isAvailable ? '#fff' : '#f5f5f5',
                      opacity: isAvailable ? 1 : 0.6,
                      transition: 'all 0.3s',
                      position: 'relative'
                    }}
                  >
                    {isToday && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          background: '#007bff',
                          color: 'white',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          fontSize: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold'
                        }}
                      >
                        !
                      </div>
                    )}

                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: isToday ? '#007bff' : '#333' }}>
                      {date.toLocaleDateString('en-IN', { weekday: 'short' })}
                    </div>

                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '10px 0' }}>
                      {date.getDate()}
                    </div>

                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                      {date.toLocaleDateString('en-IN', { month: 'short' })}
                    </div>

                    <div
                      style={{
                        fontSize: '0.8rem',
                        color: getStatusColor(),
                        fontWeight: 'bold',
                        marginTop: '10px'
                      }}
                    >
                      {getStatusText()}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '20px',
                marginTop: '40px',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '20px', height: '20px', background: '#4caf50', borderRadius: '4px' }}></div>
                <span>Available</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '20px', height: '20px', background: '#f44336', borderRadius: '4px' }}></div>
                <span>Booked</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '20px', height: '20px', background: '#007bff', borderRadius: '50%' }}></div>
                <span>Today</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Booking;
