import express from 'express';
import stripe from '../config/stripe.js';
import { protect } from '../middleware/auth.js';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';

const router = express.Router();

// Create payment intent
router.post('/create-payment-intent', protect, async (req, res) => {
  try {
    const { bookingId, amount, paymentType = 'advance' } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Validate payment amount
    if (paymentType === 'advance' && amount < 1000) {
      return res.status(400).json({
        success: false,
        message: 'Advance payment must be at least ₹1000'
      });
    }

    if (paymentType === 'remaining') {
      const remainingAmount = booking.totalAmount - booking.advancePaid;
      if (amount > remainingAmount) {
        return res.status(400).json({
          success: false,
          message: `Payment amount exceeds remaining balance of ₹${remainingAmount}`
        });
      }
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents/paise
      currency: 'usd', // Using USD for Stripe test mode
      metadata: {
        bookingId: bookingId.toString(),
        userId: req.user.id.toString(),
        paymentType: paymentType
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('Stripe payment intent error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Confirm payment and update booking
router.post('/confirm-payment', protect, async (req, res) => {
  try {
    const { paymentIntentId, bookingId } = req.body;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed'
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const amountPaid = paymentIntent.amount / 100;
    const newAdvancePaid = booking.advancePaid + amountPaid;

    // Update booking payment status
    booking.advancePaid = newAdvancePaid;

    if (newAdvancePaid >= 1000 && booking.status === 'pending') {
      booking.status = 'confirmed';
      booking.paymentStatus = 'advance_paid';
    }

    if (newAdvancePaid === booking.totalAmount) {
      booking.paymentStatus = 'fully_paid';
    }

    await booking.save();

    // Create payment record
    const payment = new Payment({
      booking: bookingId,
      user: req.user.id,
      amount: amountPaid,
      paymentType: paymentIntent.metadata.paymentType,
      paymentMethod: 'stripe',
      transactionId: paymentIntent.id,
      status: 'completed',
      stripePaymentIntentId: paymentIntent.id
    });

    await payment.save();

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      booking,
      amountPaid
    });

  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get payment methods (for saved cards)
router.get('/payment-methods', protect, async (req, res) => {
  try {
    // In a real app, you'd store customer IDs and retrieve saved payment methods
    res.json({
      success: true,
      paymentMethods: []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;