import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema({
  time: {
    type: String,
    required: true
  },
  available: {
    type: Boolean,
    default: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null
  }
});

const availabilitySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  blockReason: {
    type: String,
    default: null
  },
  slots: [slotSchema]
}, {
  timestamps: true
});

// Create index for date queries
availabilitySchema.index({ date: 1 });

export default mongoose.model('Availability', availabilitySchema);