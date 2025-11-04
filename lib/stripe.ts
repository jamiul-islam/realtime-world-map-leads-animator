import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
  typescript: true,
});

// Stripe product and price IDs
export const PREMIUM_MEMBERSHIP_PRICE_ID = 'price_1SPob0BUfqU9uGY3jHncPE0I';
export const PREMIUM_MEMBERSHIP_AMOUNT = 200; // $2.00 in cents
