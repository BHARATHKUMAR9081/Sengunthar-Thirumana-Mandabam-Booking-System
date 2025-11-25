import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/bookings');
      const bookings = response.data;
      const paymentData = bookings.map(booking => ({
        id: booking._id,
        customer: booking.userName,
        date: booking.date,
        totalAmount: booking.totalAmount,
        advancePaid: booking.advancePaid,
        balance: booking.totalAmount - booking.advancePaid,
        paymentStatus: booking.paymentStatus,
        status: booking.status
      }));
      setPayments(paymentData);
    } catch (error) {
      console.log('Using mock payment data');
      setPayments([
        {
          id: '1', customer: 'John Doe', date: '2024-01-15',
          totalAmount: 20000, advancePaid: 5000, balance: 15000,
          paymentStatus: 'advance_paid', status: 'confirmed'
        },
        {
          id: '2', customer: 'Jane Smith', date: '2024-01-20',
          totalAmount: 20000, advancePaid: 0, balance: 20000,
          paymentStatus: 'pending', status: 'pending'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading payments...</div>;

  const totalRevenue = payments.reduce((sum, payment) => sum + payment.advancePaid, 0);
  const pendingBalance = payments.reduce((sum, payment) => sum + payment.balance, 0);

  return (
    <div>
      <h1 style={{ marginBottom: '30px' }}>Payments Management</h1>

      {/* Payment Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: 'white', padding: '25px', borderRadius: '10px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#2e7d32', margin: '0 0 10px 0' }}>₹{totalRevenue}</h3>
          <p style={{ margin: 0, color: '#666' }}>Total Revenue Collected</p>
        </div>
        <div style={{ background: 'white', padding: '25px', borderRadius: '10px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#d32f2f', margin: '0 0 10px 0' }}>₹{pendingBalance}</h3>
          <p style={{ margin: 0, color: '#666' }}>Pending Balance</p>
        </div>
        <div style={{ background: 'white', padding: '25px', borderRadius: '10px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#1976d2', margin: '0 0 10px 0' }}>{payments.length}</h3>
          <p style={{ margin: 0, color: '#666' }}>Total Transactions</p>
        </div>
      </div>

      {/* Payments Table */}
      <div style={{ background: 'white', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Booking ID</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Customer</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Event Date</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Total Amount</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Advance Paid</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Balance</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Payment Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>#{payment.id?.slice(-6)}</td>
                <td style={{ padding: '12px' }}>{payment.customer}</td>
                <td style={{ padding: '12px' }}>{new Date(payment.date).toLocaleDateString('en-IN')}</td>
                <td style={{ padding: '12px' }}>₹{payment.totalAmount}</td>
                <td style={{ padding: '12px' }}>₹{payment.advancePaid}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ color: payment.balance > 0 ? '#d32f2f' : '#2e7d32', fontWeight: 'bold' }}>
                    ₹{payment.balance}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.8em', fontWeight: 'bold',
                    background: payment.paymentStatus === 'fully_paid' ? '#e8f5e8' : 
                              payment.paymentStatus === 'advance_paid' ? '#fff3cd' : '#ffebee',
                    color: payment.paymentStatus === 'fully_paid' ? '#2e7d32' : 
                          payment.paymentStatus === 'advance_paid' ? '#856404' : '#c62828'
                  }}>
                    {payment.paymentStatus?.replace('_', ' ') || 'pending'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPayments;