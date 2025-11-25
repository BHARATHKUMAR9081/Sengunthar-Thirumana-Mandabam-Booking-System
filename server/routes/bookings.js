import express from 'express';
import {
  createBooking,
  getMyBookings,
  getAllBookings,
  getBookedDates,
  makePayment,
  updateBookingStatus
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createBooking);
router.post('/payments/make', protect, makePayment); // Add payment route
router.get('/my-bookings', protect, getMyBookings);
router.get('/', protect, authorize('admin'), getAllBookings);
router.get('/booked-dates', getBookedDates);
router.put('/:id/status', protect, authorize('admin'), updateBookingStatus);

export default router;