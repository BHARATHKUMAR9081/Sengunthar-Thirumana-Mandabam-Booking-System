import express from 'express';
import Stripe from 'stripe';
import { protect } from '../middleware/auth.js';
import Booking from '../models/Booking.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create payment intent
router.post('/create-payment-intent', protect, async (req, res) => {
  try {
    const { bookingId, amount, paymentType = 'advance' } = req.body;

    console.log('Creating payment intent for booking:', bookingId, 'Amount:', amount);

    // Validate booking
    const booking = await Booking.findById(bookingId).populate('user', 'name email');
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    // Verify user owns the booking
    if (booking.user._id.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to pay for this booking' 
      });
    }

    // Validate amount
    if (amount < 1000) {
      return res.status(400).json({
        success: false,
        message: 'Minimum advance payment is ₹1000'
      });
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to paise
      currency: 'inr',
      metadata: {
        bookingId: bookingId.toString(),
        userId: req.user.id.toString(),
        paymentType: paymentType,
        bookingDate: booking.date.toISOString()
      },
      description: `Mandabam ${paymentType} payment - ${booking.eventType} on ${booking.date.toDateString()}`
    });

    console.log('Payment intent created:', paymentIntent.id);

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
    const { bookingId, paymentIntentId, amount, paymentType } = req.body;

    console.log('Confirming payment:', { bookingId, paymentIntentId, amount });

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment not completed successfully' 
      });
    }

    // Get booking
    const booking = await Booking.findById(bookingId).populate('user', 'name email');
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    // Calculate new advance paid
    const newAdvancePaid = booking.advancePaid + amount;
    const remainingAmount = booking.totalAmount - newAdvancePaid;

    // Update booking status if advance >= 1000
    if (newAdvancePaid >= 1000 && booking.status === 'pending') {
      booking.status = 'confirmed';
      booking.paymentStatus = 'advance_paid';
      console.log('✅ Booking confirmed with advance payment');
    }

    // Check if fully paid
    if (newAdvancePaid >= booking.totalAmount) {
      booking.paymentStatus = 'fully_paid';
      console.log('✅ Booking fully paid');
    }

    // Update booking
    booking.advancePaid = newAdvancePaid;
    await booking.save();

    console.log('Booking updated successfully:', booking._id);

    res.json({
      success: true,
      booking,
      message: 'Payment confirmed successfully! Booking is now confirmed.',
      remainingAmount: remainingAmount
    });

  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

export default router;