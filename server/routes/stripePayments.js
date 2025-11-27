import express from 'express';
import stripe from '../config/stripe.js';
import { protect } from '../middleware/auth.js';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';

const router = express.Router();

// FIXED AMOUNTS
const ADVANCE_AMOUNT = 5000;
const REMAINING_AMOUNT = 15000;
const TOTAL_AMOUNT = 20000;

// Create payment intent
router.post('/create-payment-intent', protect, async (req, res) => {
  try {
    const { bookingId, paymentType } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    let amount = 0;

    if (paymentType === 'advance') {
      amount = ADVANCE_AMOUNT;
    } else if (paymentType === 'remaining') {
      amount = REMAINING_AMOUNT;
    } else if (paymentType === 'full') {
      amount = TOTAL_AMOUNT;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid payment type' });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: 'usd',
      metadata: {
        bookingId: bookingId.toString(),
        userId: req.user.id.toString(),
        paymentType
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
    console.error('Stripe error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Confirm payment and update booking
router.post('/confirm-payment', protect, async (req, res) => {
  try {
    const { paymentIntentId, bookingId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ success: false, message: 'Payment not completed' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const amountPaid = paymentIntent.amount / 100;

    // Update booking payment
    booking.advancePaid += amountPaid;

    if (booking.advancePaid >= ADVANCE_AMOUNT) {
      booking.status = 'confirmed';
      booking.paymentStatus = 'advance_paid';
    }

    if (booking.advancePaid >= TOTAL_AMOUNT) {
      booking.paymentStatus = 'fully_paid';
    }

    await booking.save();

    // Save payment record
    await Payment.create({
      booking: bookingId,
      user: req.user.id,
      amount: amountPaid,
      paymentType: paymentIntent.metadata.paymentType,
      paymentMethod: 'stripe',
      transactionId: paymentIntent.id,
      status: 'completed',
      stripePaymentIntentId: paymentIntent.id
    });

    res.json({
      success: true,
      message: 'Payment successful',
      booking,
      amountPaid
    });

  } catch (error) {
    console.error('Confirm Payment Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
