import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import connectDatabase from './config/database.js';
import authRoutes from './routes/auth.js';
import bookingRoutes from './routes/bookings.js';
import stripePaymentRoutes from './routes/stripePayments.js';
import adminAuthRoutes from './routes/adminAuth.js';
import adminRoutes from './routes/admin.js'; // ✅ ADD THIS
import stripe from './config/stripe.js';



dotenv.config();
connectDatabase();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/stripe-payments', stripePaymentRoutes);
app.use('/api/admin', adminRoutes); // ✅ REGISTER ADMIN ROUTES
app.use('/api/admin', adminAuthRoutes);

app.get("/reset-admin-password", async (req, res) => {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await User.findOneAndUpdate(
    { email: "admin@mandabam.com" },
    { password: hashedPassword },
    { new: true }
  );

  res.json({
    success: true,
    message: "Admin password reset to admin123",
    admin
  });
});
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Mandabam API is running with MongoDB & Stripe',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test-stripe', async (req, res) => {
  try {
    const balance = await stripe.balance.retrieve();
    res.json({
      success: true,
      message: 'Stripe connection successful',
      balance: balance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Stripe connection failed: ' + error.message,
      hint: 'Check your STRIPE_SECRET_KEY in .env file'
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
