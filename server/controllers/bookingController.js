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
      specialRequirements,
      advanceAmount = 0
    } = req.body;

    // Normalize date — compare full day (fix duplicate booking issue)
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    // Check if ANY confirmed booking exists on the same day
    const existingBooking = await Booking.findOne({
      date: { $gte: dayStart, $lte: dayEnd },
      status: 'confirmed'
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Selected date is already booked'
      });
    }

    // Fixed package amount
    const totalAmount = 20000;

    // Create booking with pending status
    const booking = await Booking.create({
      user: req.user.id,
      date: new Date(date),
      startTime,
      endTime,
      eventType,
      guestCount,
      totalAmount,
      advancePaid: advanceAmount,
      specialRequirements,
      status: 'pending',
      paymentStatus: 'pending'
    });

    await booking.populate('user', 'name email phone');

    res.status(201).json({
      success: true,
      booking,
      message: 'Booking created. Please pay advance to confirm.',
      remainingAmount: totalAmount - advanceAmount
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Make Payment
export const makePayment = async (req, res) => {
  try {
    const { bookingId, amount, paymentMethod = 'online' } = req.body;
    
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to make payment for this booking'
      });
    }

    const newAdvancePaid = booking.advancePaid + amount;
    const remainingAmount = booking.totalAmount - newAdvancePaid;

    if (newAdvancePaid > booking.totalAmount) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount exceeds remaining balance'
      });
    }

    // Update booking
    booking.advancePaid = newAdvancePaid;

    // Confirm if advance >= ₹1000
    if (newAdvancePaid >= 1000 && booking.status === 'pending') {
      booking.status = 'confirmed';
      booking.paymentStatus = 'advance_paid';
    }

    // Fully paid
    if (newAdvancePaid === booking.totalAmount) {
      booking.paymentStatus = 'fully_paid';
    }

    await booking.save();
    await booking.populate('user', 'name email phone');

    res.json({
      success: true,
      booking,
      message:
        newAdvancePaid >= 1000
          ? 'Payment successful! Booking confirmed.'
          : 'Payment received. Pay ₹1000 or more to confirm booking.',
      remainingAmount
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
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
