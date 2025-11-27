import Booking from '../models/Booking.js';

// Create Booking
export const createBooking = async (req, res) => {
  try {
    const {
      date,
      startTime,
      endTime,
      eventType,
      guestCount,
      specialRequirements
    } = req.body;

    const totalAmount = 20000; // FIXED PACKAGE
    const advancePaid = 0;

    const booking = await Booking.create({
      user: req.user.id,
      date: new Date(date),
      startTime,
      endTime,
      eventType,
      guestCount,
      totalAmount,
      advancePaid,
      specialRequirements,
      status: 'pending',
      paymentStatus: 'pending'
    });

    res.status(201).json({
      success: true,
      booking,
      message: 'Booking created successfully',
      remainingAmount: 15000
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Make Payment
export const makePayment = async (req, res) => {
  try {
    const { bookingId, amount } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Only fixed valid amounts
    if (![5000, 15000, 20000].includes(amount)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment amount. Allowed: 5000, 15000, 20000'
      });
    }

    booking.advancePaid += amount;

    if (booking.advancePaid >= 5000) {
      booking.status = 'confirmed';
      booking.paymentStatus = 'advance_paid';
    }

    if (booking.advancePaid >= 20000) {
      booking.paymentStatus = 'fully_paid';
    }

    await booking.save();

    res.json({
      success: true,
      booking,
      message: 'Payment successful'
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// My Bookings
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Admin: Get All Bookings
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Only Confirmed Booked Dates
export const getBookedDates = async (req, res) => {
  try {
    const bookings = await Booking.find({
      status: 'confirmed'
    }).select('date');

    const bookedDates = bookings.map(b =>
      new Date(b.date).toISOString().split('T')[0]
    );

    res.json({
      success: true,
      bookedDates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Admin: Update Booking Status
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    booking.status = status;
    await booking.save();
    await booking.populate('user', 'name email phone');

    res.json({
      success: true,
      booking,
      message: 'Booking status updated'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
