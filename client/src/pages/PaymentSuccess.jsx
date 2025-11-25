import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const paymentIntent = searchParams.get('payment_intent');
    
    if (paymentIntent) {
      // Payment was successful via redirect
      setTimeout(() => {
        navigate('/my-bookings');
      }, 3000);
    }
  }, [searchParams, navigate]);

  return (
    <div style={{ marginTop: '100px', padding: '20px' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>✅</div>
          <h2>Payment Successful!</h2>
          <p>Your payment has been processed successfully.</p>
          <p>Redirecting to your bookings...</p>
          
          <button 
            onClick={() => navigate('/my-bookings')}
            className="btn"
            style={{ marginTop: '20px' }}
          >
            Go to My Bookings
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;