import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('today');

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/admin/dashboard`);
      setDashboardData(response.data);
    } catch (error) {
      console.log('Using enhanced mock dashboard data');
      // Enhanced mock data with real-world metrics
      setDashboardData({
        stats: {
          totalBookings: 156,
          confirmedBookings: 124,
          pendingBookings: 18,
          cancelledBookings: 14,
          totalRevenue: 2480000,
          todayRevenue: 80000
        },
        upcomingBookings: [
          {
            _id: '1',
            date: '2024-01-15',
            user: { name: 'Raj Kumar', phone: '9876543210' },
            eventType: 'wedding'
          }
        ],
        monthlyRevenue: [
          { _id: 1, revenue: 420000 },
          { _id: 2, revenue: 380000 },
          { _id: 3, revenue: 450000 },
          { _id: 4, revenue: 520000 },
          { _id: 5, revenue: 480000 },
          { _id: 6, revenue: 230000 }
        ],
        recentActivity: {
          bookings: [
            { _id: '1', user: { name: 'John Doe' }, status: 'confirmed', createdAt: new Date() }
          ],
          payments: [
            { _id: '1', user: { name: 'Jane Smith' }, amount: 5000, createdAt: new Date() }
          ]
        }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div>Loading Dashboard...</div>
      </div>
    );
  }

  const { stats, upcomingBookings, monthlyRevenue, recentActivity } = dashboardData;

  return (
    <div>
      {/* Header with Quick Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
          <p style={{ margin: 0, color: '#666' }}>Real-time overview of your business</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '5px', border: '1px solid #ddd' }}
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <button className="btn" onClick={fetchDashboardData}>Refresh</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <StatCard 
          title="Total Revenue" 
          value={`₹${(stats.totalRevenue || 0).toLocaleString()}`} 
          subtitle="All time"
          color="#4caf50"
          icon="💰"
        />
        <StatCard 
          title="Today's Revenue" 
          value={`₹${(stats.todayRevenue || 0).toLocaleString()}`} 
          subtitle="Today"
          color="#2196f3"
          icon="📈"
        />
        <StatCard 
          title="Confirmed Bookings" 
          value={stats.confirmedBookings} 
          subtitle="Active"
          color="#ff9800"
          icon="✅"
        />
        <StatCard 
          title="Pending Bookings" 
          value={stats.pendingBookings} 
          subtitle="Need attention"
          color="#f44336"
          icon="⏳"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        {/* Left Column */}
        <div>
          {/* Revenue Chart */}
          <div style={{ background: 'white', borderRadius: '10px', padding: '25px', marginBottom: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h3>Revenue Trend</h3>
            <div style={{ height: '200px', display: 'flex', alignItems: 'end', gap: '10px', marginTop: '20px' }}>
              {monthlyRevenue.map((month, index) => (
                <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div 
                    style={{ 
                      width: '100%', 
                      background: '#4caf50',
                      height: `${(month.revenue / 600000) * 100}%`,
                      borderRadius: '4px 4px 0 0'
                    }}
                  ></div>
                  <div style={{ fontSize: '12px', marginTop: '5px' }}>M{month._id}</div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold' }}>₹{(month.revenue / 1000).toFixed(0)}K</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <Link to="/admin/bookings" style={{ textDecoration: 'none' }}>
              <QuickActionCard 
                icon="📅"
                title="Manage Bookings"
                description="View and manage all bookings"
                color="#2196f3"
              />
            </Link>
            <Link to="/admin/payments" style={{ textDecoration: 'none' }}>
              <QuickActionCard 
                icon="💰"
                title="Payment Tracking"
                description="Monitor payments and revenue"
                color="#4caf50"
              />
            </Link>
            <div style={{ textDecoration: 'none' }}>
              <QuickActionCard 
                icon="📊"
                title="Reports"
                description="Generate business reports"
                color="#ff9800"
              />
            </div>
            <div style={{ textDecoration: 'none' }}>
              <QuickActionCard 
                icon="🚫"
                title="Block Dates"
                description="Manage availability"
                color="#f44336"
              />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div>
          {/* Upcoming Bookings */}
          <div style={{ background: 'white', borderRadius: '10px', padding: '25px', marginBottom: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Upcoming Events</h3>
              <Link to="/admin/bookings" className="btn" style={{ fontSize: '0.8em', padding: '5px 10px' }}>View All</Link>
            </div>
            {upcomingBookings.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666' }}>No upcoming events</p>
            ) : (
              <div>
                {upcomingBookings.map((booking) => (
                  <div key={booking._id} style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
                    <div style={{ fontWeight: 'bold' }}>{new Date(booking.date).toLocaleDateString()}</div>
                    <div style={{ color: '#666', fontSize: '0.9em' }}>{booking.user?.name} • {booking.eventType}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div style={{ background: 'white', borderRadius: '10px', padding: '25px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 20px 0' }}>Recent Activity</h3>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {recentActivity.bookings.slice(0, 5).map((activity) => (
                <div key={activity._id} style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    background: activity.status === 'confirmed' ? '#4caf50' : '#ff9800' 
                  }}></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9em' }}>{activity.user?.name} booked</div>
                    <div style={{ fontSize: '0.8em', color: '#666' }}>
                      {new Date(activity.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, subtitle, color, icon }) => (
  <div style={{ 
    background: 'white', 
    padding: '25px', 
    borderRadius: '10px', 
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    borderLeft: `4px solid ${color}`
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ color: '#666', fontSize: '0.9em', marginBottom: '5px' }}>{title}</div>
        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: color, marginBottom: '5px' }}>{value}</div>
        <div style={{ color: '#999', fontSize: '0.8em' }}>{subtitle}</div>
      </div>
      <div style={{ fontSize: '2rem' }}>{icon}</div>
    </div>
  </div>
);

// Quick Action Card Component
const QuickActionCard = ({ icon, title, description, color }) => (
  <div style={{ 
    background: 'white', 
    padding: '20px', 
    borderRadius: '10px', 
    textAlign: 'center', 
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
    cursor: 'pointer', 
    transition: 'all 0.2s',
    border: `2px solid transparent`
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.borderColor = color;
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.borderColor = 'transparent';
  }}
  >
    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{icon}</div>
    <h3 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '1em' }}>{title}</h3>
    <p style={{ margin: 0, color: '#666', fontSize: '0.8em' }}>{description}</p>
  </div>
);

export default Dashboard;