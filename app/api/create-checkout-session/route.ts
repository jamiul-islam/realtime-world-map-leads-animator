import { NextRequest, NextResponse } from 'next/server';
import { stripe, PREMIUM_MEMBERSHIP_PRICE_ID } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE!;

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: PREMIUM_MEMBERSHIP_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${request.nextUrl.origin}/join-now/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/join-now/canceled`,
      customer_email: email,
      metadata: {
        user_email: email,
      },
    });

    // Create initial payment record in Supabase with pending status
    await supabase.from('payments').insert({
      user_email: email,
      stripe_session_id: session.id,
      amount: 200,
      currency: 'usd',
      status: 'pending',
      metadata: { session_created_at: new Date().toISOString() },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
