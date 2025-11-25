import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

// Validate Stripe key
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is missing from environment variables');
}

// For development, we need to handle domain issues
const stripeConfig = {
  apiVersion: '2024-09-30.acacia',
  // Add these options for better error handling
  maxNetworkRetries: 2,
  timeout: 10000,
  telemetry: false,
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, stripeConfig);

export default stripe;