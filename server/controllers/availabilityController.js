import Availability from '../models/Availability.js';
import Booking from '../models/Booking.js';

// Initialize availability for a date
const initializeDateSlots = (date) => {
  const slots = [];
  // Create time slots from 6:00 AM to 10:00 PM
  for (let hour = 6; hour <= 22; hour++) {
    slots.push({
      time: `${hour.toString().padStart(2, '0')}:00`,
      available: true,
      bookingId: null
    });
  }
  return slots;
};

// Get availability for date range
export const getAvailability = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Get all dates in range
    const dates = [];
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      dates.push(new Date(date));
    }

    // Get or create availability for each date
    const availabilityData = {};
    
    for (const date of dates) {
      const dateStr = date.toISOString().split('T')[0];
      
      let availability = await Availability.findOne({ date });
      
      if (!availability) {
        // Create new availability record for this date
        availability = await Availability.create({
          date,
          slots: initializeDateSlots(date)
        });
      }

      // Calculate availability status
      const totalSlots = availability.slots.length;
      const bookedSlots = availability.slots.filter(slot => !slot.available).length;
      
      let status = 'available';
      if (bookedSlots === totalSlots) {
        status = 'fully-booked';
      } else if (bookedSlots > 0) {
        status = 'partially-booked';
      }

      availabilityData[dateStr] = {
        date: dateStr,
        status,
        totalSlots,
        bookedSlots,
        availableSlots: totalSlots - bookedSlots,
        isBlocked: availability.isBlocked,
        slots: availability.slots
      };
    }

    res.json({
      success: true,
      data: availabilityData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get specific date availability
export const getDateAvailability = async (req, res) => {
  try {
    const { date } = req.params;
    
    let availability = await Availability.findOne({ date });
    
    if (!availability) {
      // Create new availability if doesn't exist
      availability = await Availability.create({
        date,
        slots: initializeDateSlots(new Date(date))
      });
    }

    const totalSlots = availability.slots.length;
    const bookedSlots = availability.slots.filter(slot => !slot.available).length;

    res.json({
      success: true,
      data: {
        date,
        status: availability.isBlocked ? 'blocked' : 
                bookedSlots === totalSlots ? 'fully-booked' :
                bookedSlots > 0 ? 'partially-booked' : 'available',
        totalSlots,
        bookedSlots,
        availableSlots: totalSlots - bookedSlots,
        isBlocked: availability.isBlocked,
        slots: availability.slots
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Check specific time slot availability
export const checkTimeSlot = async (req, res) => {
  try {
    const { date, startTime, endTime } = req.body;

    let availability = await Availability.findOne({ date });
    
    if (!availability) {
      availability = await Availability.create({
        date,
        slots: initializeDateSlots(new Date(date))
      });
    }

    if (availability.isBlocked) {
      return res.json({
        success: true,
        available: false,
        reason: 'Date is blocked by admin'
      });
    }

    const startSlot = availability.slots.find(slot => slot.time === startTime);
    const endSlot = availability.slots.find(slot => slot.time === endTime);

    if (!startSlot || !endSlot) {
      return res.json({
        success: true,
        available: false,
        reason: 'Invalid time slots'
      });
    }

    const isAvailable = startSlot.available && endSlot.available;

    res.json({
      success: true,
      available: isAvailable,
      reason: isAvailable ? 'Available for booking' : 'Time slots are already booked'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Admin: Block a date
export const blockDate = async (req, res) => {
  try {
    const { date, reason } = req.body;

    let availability = await Availability.findOne({ date });
    
    if (!availability) {
      availability = await Availability.create({
        date,
        slots: initializeDateSlots(new Date(date))
      });
    }

    availability.isBlocked = true;
    availability.blockReason = reason;
    
    // Mark all slots as unavailable
    availability.slots.forEach(slot => {
      slot.available = false;
    });

    await availability.save();

    res.json({
      success: true,
      message: 'Date blocked successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Admin: Unblock a date
export const unblockDate = async (req, res) => {
  try {
    const { date } = req.body;

    const availability = await Availability.findOne({ date });
    
    if (availability) {
      availability.isBlocked = false;
      availability.blockReason = null;
      
      // Mark all slots as available
      availability.slots.forEach(slot => {
        slot.available = true;
        slot.bookingId = null;
      });

      await availability.save();
    }

    res.json({
      success: true,
      message: 'Date unblocked successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};