import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Availability from "../models/Availability.js";
import User from "../models/User.js";

/******************************
 * ENHANCED ADMIN DASHBOARD STATS
 ******************************/
export const getDashboard = async (req, res) => {
  try {
    // Real-time stats
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: "confirmed" });
    const pendingBookings = await Booking.countDocuments({ status: "pending" });
    const cancelledBookings = await Booking.countDocuments({ status: "cancelled" });

    // Revenue calculations with fixed amounts
    const revenueData = await Payment.aggregate([
      { $match: { status: "completed" } },
      { 
        $group: { 
          _id: null, 
          totalRevenue: { $sum: "$amount" },
          todayRevenue: { 
            $sum: { 
              $cond: [
                { $gte: ["$createdAt", new Date(new Date().setHours(0,0,0,0))] },
                "$amount",
                0
              ]
            }
          }
        } 
      }
    ]);

    // Upcoming bookings (next 7 days)
    const upcomingBookings = await Booking.find({
      date: { $gte: new Date(), $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      status: "confirmed"
    })
    .populate("user", "name phone")
    .sort({ date: 1 })
    .limit(5);

    // Monthly revenue trend
    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: new Date(new Date().getFullYear(), 0, 1) }
        }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$amount" },
          bookings: { $addToSet: "$booking" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.json({
      success: true,
      stats: {
        totalBookings,
        confirmedBookings,
        pendingBookings,
        cancelledBookings,
        totalRevenue: revenueData[0]?.totalRevenue || 0,
        todayRevenue: revenueData[0]?.todayRevenue || 0
      },
      upcomingBookings,
      monthlyRevenue,
      recentActivity: await getRecentActivity()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/******************************
 * GET RECENT ACTIVITY
 ******************************/
const getRecentActivity = async () => {
  const recentBookings = await Booking.find()
    .populate("user", "name")
    .sort({ createdAt: -1 })
    .limit(10)
    .select("user status createdAt date");

  const recentPayments = await Payment.find()
    .populate("user", "name")
    .populate("booking")
    .sort({ createdAt: -1 })
    .limit(10)
    .select("user amount createdAt");

  return {
    bookings: recentBookings,
    payments: recentPayments
  };
};

/******************************
 * ENHANCED BOOKINGS MANAGEMENT
 ******************************/
export const getAllBookings = async (req, res) => {
  try {
    const { status, date, page = 1, limit = 10 } = req.query;
    
    let filter = {};
    if (status) filter.status = status;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.date = { $gte: startDate, $lt: endDate };
    }

    const bookings = await Booking.find(filter)
      .populate("user", "name phone email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(filter);

    res.json({
      success: true,
      bookings,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalBookings: total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/******************************
 * GET BOOKING BY ID
 ******************************/
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "name phone email");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/******************************
 * CANCEL BOOKING
 ******************************/
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    booking.status = "cancelled";
    booking.paymentStatus = "pending";
    await booking.save();

    // Unblock date
    const dateStr = booking.date.toISOString().split("T")[0];
    const availability = await Availability.findOne({ date: dateStr });
    if (availability) {
      availability.isBlocked = false;
      availability.slots.forEach((s) => {
        s.available = true;
        s.bookingId = null;
      });
      await availability.save();
    }

    res.json({ success: true, message: "Booking cancelled", booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/******************************
 * MARK FINAL PAYMENT COMPLETED
 ******************************/
export const markBookingPaid = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    booking.advancePaid = 20000; // Fixed full amount
    booking.paymentStatus = "fully_paid";
    booking.status = "confirmed";

    await booking.save();

    res.json({ success: true, message: "Final payment marked completed", booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/******************************
 * GET ALL PAYMENTS
 ******************************/
export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("booking", "date eventType")
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/******************************
 * ADVANCED REVENUE ANALYTICS
 ******************************/
export const getRevenue = async (req, res) => {
  try {
    const { period = "monthly", year = new Date().getFullYear() } = req.query;

    let groupStage;
    let matchStage = {
      status: "completed",
      createdAt: {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31`)
      }
    };

    switch (period) {
      case "daily":
        groupStage = {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          }
        };
        break;
      case "weekly":
        groupStage = {
          _id: {
            year: { $year: "$createdAt" },
            week: { $week: "$createdAt" }
          }
        };
        break;
      default: // monthly
        groupStage = {
          _id: { 
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          }
        };
    }

    const revenue = await Payment.aggregate([
      { $match: matchStage },
      {
        $group: {
          ...groupStage,
          totalRevenue: { $sum: "$amount" },
          transactionCount: { $sum: 1 },
          averageTransaction: { $avg: "$amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.week": 1 } }
    ]);

    // Payment method breakdown
    const paymentMethods = await Payment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$paymentMethod",
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      period,
      year,
      revenue,
      paymentMethods,
      summary: {
        totalRevenue: revenue.reduce((sum, item) => sum + item.totalRevenue, 0),
        totalTransactions: revenue.reduce((sum, item) => sum + item.transactionCount, 0)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/******************************
 * BLOCK DATE
 ******************************/
export const blockDate = async (req, res) => {
  try {
    const { date, reason } = req.body;

    let availability = await Availability.findOne({ date });

    if (!availability) {
      availability = new Availability({
        date,
        isBlocked: true,
        blockReason: reason,
        slots: []
      });
    }

    availability.isBlocked = true;
    availability.blockReason = reason;

    availability.slots.forEach((slot) => {
      slot.available = false;
      slot.bookingId = null;
    });

    await availability.save();

    res.json({ success: true, message: "Date blocked", availability });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/******************************
 * UNBLOCK DATE
 ******************************/
export const unblockDate = async (req, res) => {
  try {
    const { date } = req.body;

    const availability = await Availability.findOne({ date });

    if (!availability) {
      return res.status(404).json({ success: false, message: "Date not found" });
    }

    availability.isBlocked = false;
    availability.blockReason = null;

    availability.slots.forEach((slot) => {
      slot.available = true;
      slot.bookingId = null;
    });

    await availability.save();

    res.json({ success: true, message: "Date unblocked", availability });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/******************************
 * GET ALL BLOCKED DATES
 ******************************/
export const getBlockedDates = async (req, res) => {
  try {
    const blocked = await Availability.find({ isBlocked: true });

    res.json({ success: true, blocked });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/******************************
 * BULK OPERATIONS
 ******************************/
export const bulkUpdateBookings = async (req, res) => {
  try {
    const { bookingIds, status } = req.body;

    if (!bookingIds || !bookingIds.length || !status) {
      return res.status(400).json({
        success: false,
        message: "Booking IDs and status are required"
      });
    }

    const result = await Booking.updateMany(
      { _id: { $in: bookingIds } },
      { $set: { status } }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} bookings updated to ${status}`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/******************************
 * EXPORT DATA
 ******************************/
export const exportBookings = async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;

    let filter = {};
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const bookings = await Booking.find(filter)
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      // Simple CSV export
      const csvData = bookings.map(booking => ({
        'Booking ID': booking._id,
        'Customer': booking.user?.name,
        'Email': booking.user?.email,
        'Phone': booking.user?.phone,
        'Event Date': booking.date,
        'Event Type': booking.eventType,
        'Total Amount': booking.totalAmount,
        'Advance Paid': booking.advancePaid,
        'Status': booking.status,
        'Payment Status': booking.paymentStatus,
        'Created At': booking.createdAt
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=bookings.csv');
      return res.send(convertToCSV(csvData));
    }

    res.json({
      success: true,
      bookings,
      exportInfo: {
        total: bookings.length,
        period: startDate && endDate ? `${startDate} to ${endDate}` : 'All time'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function for CSV conversion
const convertToCSV = (data) => {
  if (!data.length) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const values = headers.map(header => {
      const escaped = ('' + row[header]).replace(/"/g, '\\"');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
};