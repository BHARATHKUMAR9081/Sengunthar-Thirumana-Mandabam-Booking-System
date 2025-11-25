import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAdmin } from '../context/AdminContext';

const AdminDashboard = () => {
  const [calendar, setCalendar] = useState({});
  const [bookings, setBookings] = useState([]);
  const [view, setView] = useState('calendar');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const { admin, token } = useAdmin();

  useEffect(() => {
    if (admin) {
      fetchAllData();
    }
  }, [admin]);

  const fetchAllData = async () => {
    try {
      await Promise.all([fetchBookedDates(), fetchBookings()]);
      setLastUpdated(new Date());
    } catch (error) {
      console.log('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get booked dates from the API
  const fetchBookedDates = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/bookings/booked-dates');
      const bookedDates = response.data.bookedDates || [];
      
      console.log('Booked dates:', bookedDates);
      
      // Create calendar with booked dates
      const today = new Date();
      const calendarData = {};
      
      for (let i = 0; i < 60; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        const isBooked = bookedDates.includes(dateStr);
        
        calendarData[dateStr] = {
          date: dateStr,
          isBooked: isBooked,
          displayDate: date.toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
          }),
          fullDate: date.toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        };
      }
      
      setCalendar(calendarData);
      
    } catch (error) {
      console.log('Error fetching booked dates:', error);
      // Fallback: Create mock booked dates for demo
      createCalendarWithMockData();
    }
  };

  // Get all bookings with admin authentication
  const fetchBookings = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      // Try admin endpoint first
      const response = await axios.get('http://localhost:5000/api/admin/bookings', config);
      
      if (response.data.success && response.data.bookings) {
        setBookings(response.data.bookings);
      } else {
        // Fallback to regular bookings endpoint
        const fallbackResponse = await axios.get('http://localhost:5000/api/bookings', config);
        setBookings(fallbackResponse.data.bookings || []);
      }
    } catch (error) {
      console.log('Error fetching bookings:', error);
      
      // Mock data for demo purposes
      const mockBookings = [
        {
          _id: '1',
          date: '2024-01-15',
          startTime: '18:00',
          endTime: '18:00',
          totalAmount: 20000,
          advancePaid: 5000,
          status: 'confirmed',
          eventType: 'wedding',
          guestCount: 150,
          user: { 
            name: 'John Doe', 
            phone: '9876543210',
            email: 'john@example.com'
          }
        },
        {
          _id: '2',
          date: '2024-01-20',
          startTime: '19:00',
          endTime: '17:00',
          totalAmount: 20000,
          advancePaid: 1000,
          status: 'pending',
          eventType: 'birthday',
          guestCount: 100,
          user: { 
            name: 'Jane Smith', 
            phone: '9876543211',
            email: 'jane@example.com'
          }
        },
        {
          _id: '3',
          date: '2024-01-25',
          startTime: '18:00',
          endTime: '18:00',
          totalAmount: 20000,
          advancePaid: 20000,
          status: 'confirmed',
          eventType: 'reception',
          guestCount: 200,
          user: { 
            name: 'Robert Johnson', 
            phone: '9876543212',
            email: 'robert@example.com'
          }
        }
      ];
      setBookings(mockBookings);
    }
  };

  const createCalendarWithMockData = () => {
    const today = new Date();
    const calendarData = {};
    
    // Create some mock booked dates for demo
    const mockBookedDates = [];
    for (let i = 1; i <= 9; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      mockBookedDates.push(date.toISOString().split('T')[0]);
    }
    
    for (let i = 0; i < 60; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const isBooked = mockBookedDates.includes(dateStr);
      
      calendarData[dateStr] = {
        date: dateStr,
        isBooked: isBooked,
        displayDate: date.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short'
        }),
        fullDate: date.toLocaleDateString('en-IN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      };
    }
    setCalendar(calendarData);
  };

  const refreshData = () => {
    setLoading(true);
    fetchAllData();
  };

  const getDateColor = (dateInfo) => {
    return dateInfo.isBooked ? '#f44336' : '#4caf50';
  };

  const getDateStatus = (dateInfo) => {
    return dateInfo.isBooked ? 'BOOKED' : 'AVAILABLE';
  };

  // Count stats - FIXED calculations
  const calendarDates = Object.values(calendar);
  const bookedCount = calendarDates.filter(date => date.isBooked).length;
  const availableCount = calendarDates.filter(date => !date.isBooked).length;
  const totalBookingsCount = bookings.length;
  const confirmedBookingsCount = bookings.filter(b => 
    b.status === 'confirmed' || b.status === 'Confirmed'
  ).length;

  const today = new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <div style={{ marginTop: '100px', padding: '20px', textAlign: 'center' }}>
        <div className="container">
          <h2>Loading Calendar...</h2>
          <p>Syncing with booking data...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '100px', padding: '20px' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: 0 }}>Admin Dashboard - Mandabam Management</h2>
            {lastUpdated && (
              <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '0.9rem' }}>
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          <button className="btn" onClick={refreshData} disabled={loading}>
            {loading ? 'Refreshing...' : '🔄 Refresh'}
          </button>
        </div>
        
        {/* Quick Stats - FIXED display */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '15px', 
          marginBottom: '30px' 
        }}>
          <div style={{ 
            background: '#4caf50', 
            color: 'white', 
            padding: '20px', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: '2rem' }}>{availableCount}</h3>
            <p style={{ margin: 0 }}>Available Dates</p>
          </div>
          <div style={{ 
            background: '#f44336', 
            color: 'white', 
            padding: '20px', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: '2rem' }}>{bookedCount}</h3>
            <p style={{ margin: 0 }}>Booked Dates</p>
          </div>
          <div style={{ 
            background: '#2196f3', 
            color: 'white', 
            padding: '20px', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: '2rem' }}>{totalBookingsCount}</h3>
            <p style={{ margin: 0 }}>Total Bookings</p>
          </div>
          <div style={{ 
            background: '#ff9800', 
            color: 'white', 
            padding: '20px', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: '2rem' }}>{confirmedBookingsCount}</h3>
            <p style={{ margin: 0 }}>Confirmed</p>
          </div>
        </div>
        
        <div style={{ marginBottom: '30px' }}>
          <button 
            onClick={() => setView('calendar')} 
            className={`btn ${view === 'calendar' ? '' : 'btn-secondary'}`}
          >
            📅 Calendar View
          </button>
          <button 
            onClick={() => setView('bookings')} 
            className={`btn ${view === 'bookings' ? '' : 'btn-secondary'}`}
            style={{ marginLeft: '10px' }}
          >
            📋 All Bookings ({totalBookingsCount})
          </button>
        </div>

        {view === 'calendar' && (
          <div>
            <h3>Venue Availability Calendar</h3>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Showing next 60 days. Green = Available, Red = Booked
              {bookedCount > 0 && ` • ${bookedCount} date(s) booked`}
            </p>
            
            {/* Legend */}
            <div style={{ 
              display: 'flex', 
              gap: '20px', 
              marginBottom: '20px',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '20px', height: '20px', background: '#4caf50', borderRadius: '4px' }}></div>
                <span>Available</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '20px', height: '20px', background: '#f44336', borderRadius: '4px' }}></div>
                <span>Booked</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '20px', height: '20px', background: '#2196f3', borderRadius: '50%' }}></div>
                <span>Today</span>
              </div>
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
              gap: '15px',
              marginTop: '20px'
            }}>
              {Object.entries(calendar).map(([date, info]) => (
                <div
                  key={date}
                  style={{
                    padding: '15px',
                    border: `2px solid ${getDateColor(info)}`,
                    borderRadius: '10px',
                    background: date === today ? '#e3f2fd' : '#fff',
                    textAlign: 'center',
                    minHeight: '80px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    cursor: 'default',
                    position: 'relative'
                  }}
                >
                  {/* Today indicator */}
                  {date === today && (
                    <div style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      background: '#2196f3',
                      color: 'white',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      fontSize: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold'
                    }}>
                      !
                    </div>
                  )}
                  
                  <div style={{ 
                    fontWeight: 'bold', 
                    fontSize: '1rem', 
                    marginBottom: '8px',
                    color: info.isBooked ? '#f44336' : '#4caf50'
                  }}>
                    {info.displayDate}
                  </div>
                  
                  <div style={{ 
                    color: getDateColor(info),
                    fontWeight: 'bold',
                    fontSize: '0.9rem'
                  }}>
                    {getDateStatus(info)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'bookings' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>All Bookings ({totalBookingsCount})</h3>
              <button className="btn" onClick={refreshData}>Refresh</button>
            </div>
            
            {bookings.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '50px', 
                background: '#f8f9fa', 
                borderRadius: '8px' 
              }}>
                <h4>No Bookings Found</h4>
                <p style={{ color: '#666' }}>There are no bookings in the system yet.</p>
              </div>
            ) : (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
                gap: '20px' 
              }}>
                {bookings.map((booking) => (
                  <div key={booking._id} style={{
                    background: 'white',
                    borderRadius: '10px',
                    padding: '20px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    border: '1px solid #e0e0e0'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      marginBottom: '15px'
                    }}>
                      <h4 style={{ margin: 0, color: '#333' }}>
                        {booking.eventType ? booking.eventType.charAt(0).toUpperCase() + booking.eventType.slice(1) : 'Event'}
                      </h4>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        background: booking.status === 'confirmed' ? '#e8f5e8' : 
                                  booking.status === 'pending' ? '#fff3cd' : '#ffebee',
                        color: booking.status === 'confirmed' ? '#2e7d32' : 
                              booking.status === 'pending' ? '#856404' : '#c62828'
                      }}>
                        {booking.status ? booking.status.toUpperCase() : 'PENDING'}
                      </span>
                    </div>
                    
                    <div style={{ marginBottom: '10px' }}>
                      <strong>📅 Date:</strong> {new Date(booking.date).toLocaleDateString('en-IN')}
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>👤 Customer:</strong> {booking.user?.name || 'N/A'}
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>📞 Phone:</strong> {booking.user?.phone || 'N/A'}
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>⏰ Time:</strong> {booking.startTime} to {booking.endTime}
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>💰 Total Amount:</strong> ₹{booking.totalAmount || 20000}
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>💳 Advance Paid:</strong> ₹{booking.advancePaid || 0}
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>👥 Guests:</strong> {booking.guestCount || 'N/A'}
                    </div>
                    
                    {booking.specialRequirements && (
                      <div style={{ marginBottom: '10px' }}>
                        <strong>📝 Special Requirements:</strong> {booking.specialRequirements}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;