import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  useStripe,
  useElements,
  PaymentElement,
} from '@stripe/react-stripe-js';
import axios from 'axios';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ bookingId, amount, paymentType, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      setError('Stripe not loaded');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('Processing payment...');

    try {
      // Confirm payment
      const { error: submitError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success?booking=${bookingId}`,
        },
        redirect: 'if_required',
      });

      if (submitError) {
        console.error('Stripe confirmation error:', submitError);
        setError(submitError.message || 'Payment failed');
        setLoading(false);
        return;
      }

      // If we have a payment intent, check its status
      if (paymentIntent) {
        console.log('Payment intent status:', paymentIntent.status);
        
        if (paymentIntent.status === 'succeeded') {
          // Confirm with our backend
          const result = await axios.post('http://localhost:5000/api/stripe-payments/confirm-payment', {
            paymentIntentId: paymentIntent.id,
            bookingId
          });

          if (result.data.success) {
            setMessage('Payment successful!');
            onSuccess(result.data);
          } else {
            setError('Payment confirmation failed');
          }
        } else if (paymentIntent.status === 'requires_action') {
          setMessage('Payment requires additional verification...');
        } else {
          setError(`Payment status: ${paymentIntent.status}`);
        }
      } else {
        // Handle redirect flow
        setMessage('Redirecting to complete payment...');
      }

    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
      <div style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '10px',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>
          Pay {paymentType === 'advance' ? 'Advance' : 'Remaining Amount'}
        </h3>
        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
          ${amount} USD
        </p>
        <p style={{ color: '#666', margin: '5px 0 0 0' }}>
          Mandabam Venue Booking
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '10px',
          border: '1px solid #e0e0e0',
          marginBottom: '20px'
        }}>
          <PaymentElement 
            options={{
              layout: {
                type: 'tabs',
                defaultCollapsed: false
              }
            }}
          />
        </div>
        
        {message && (
          <div style={{ 
            color: '#2e7d32', 
            background: '#e8f5e8', 
            padding: '10px', 
            borderRadius: '5px',
            margin: '15px 0',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}

        {error && (
          <div style={{ 
            color: '#d32f2f', 
            background: '#ffebee', 
            padding: '10px', 
            borderRadius: '5px',
            margin: '15px 0'
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="submit" 
            disabled={!stripe || loading}
            className="btn"
            style={{ flex: 1 }}
          >
            {loading ? 'Processing...' : `Pay $${amount}`}
          </button>
          
          <button 
            type="button" 
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
        </div>

        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          background: '#fff3cd', 
          borderRadius: '5px',
          fontSize: '0.9em'
        }}>
          <strong>Test Card:</strong> 4242 4242 4242 4242<br/>
          <strong>Exp:</strong> 12/34 <strong>CVC:</strong> 123 <strong>ZIP:</strong> 12345
        </div>
      </form>
    </div>
  );
};

const StripePayment = ({ bookingId, amount, paymentType, onSuccess, onCancel }) => {
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        console.log('Creating payment intent for booking:', bookingId);
        
        const response = await axios.post('http://localhost:5000/api/stripe-payments/create-payment-intent', {
          bookingId,
          amount,
          paymentType
        });

        if (response.data.success) {
          setClientSecret(response.data.clientSecret);
          console.log('Client secret received');
        } else {
          setError(response.data.message || 'Failed to create payment');
        }
      } catch (err) {
        console.error('Payment setup error:', err);
        setError(err.response?.data?.message || 'Payment setup failed');
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [bookingId, amount, paymentType]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div>Setting up secure payment...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div style={{ color: '#d32f2f', marginBottom: '15px' }}>
          {error}
        </div>
        <button 
          onClick={onCancel}
          className="btn btn-secondary"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div style={{ color: '#d32f2f' }}>Payment setup failed</div>
        <button 
          onClick={onCancel}
          className="btn btn-secondary"
          style={{ marginTop: '15px' }}
        >
          Go Back
        </button>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#007bff',
        colorBackground: '#ffffff',
        colorText: '#32325d',
        fontFamily: 'Arial, sans-serif',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm 
        bookingId={bookingId}
        amount={amount}
        paymentType={paymentType}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </Elements>
  );
};

export default StripePayment;