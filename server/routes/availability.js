import express from 'express';
import {
  getAvailability,
  getDateAvailability,
  checkTimeSlot,
  blockDate,
  unblockDate
} from '../controllers/availabilityController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAvailability);
router.get('/:date', getDateAvailability);
router.post('/check-slot', checkTimeSlot);
router.post('/block', protect, authorize('admin'), blockDate);
router.post('/unblock', protect, authorize('admin'), unblockDate);

export default router;