import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';

const router = express.Router();

// Get all bookings (admin only)
router.get('/bookings', protect, authorize('admin'), async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      bookings: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get dashboard stats (admin only)
router.get('/dashboard', protect, authorize('admin'), async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const totalUsers = await User.countDocuments({ role: 'customer' });

    // Calculate total revenue
    const revenueResult = await Booking.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$advancePaid' }
        }
      }
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    res.json({
      success: true,
      stats: {
        totalBookings,
        confirmedBookings,
        pendingBookings,
        totalUsers,
        totalRevenue
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;