import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  eventType: {
    type: String,
    required: true
  },
  guestCount: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 20000
  },
  advancePaid: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending' // Changed to pending initially
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'advance_paid', 'fully_paid'],
    default: 'pending'
  },
  specialRequirements: String
}, {
  timestamps: true
});

export default mongoose.model('Booking', bookingSchema);