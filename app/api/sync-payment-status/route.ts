import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE!;

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Get session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Determine status based on Stripe session
    let status: 'pending' | 'succeeded' | 'canceled' | 'failed' = 'pending';
    
    if (session.payment_status === 'paid') {
      status = 'succeeded';
    } else if (session.status === 'expired') {
      status = 'canceled';
    } else if (session.payment_status === 'unpaid') {
      status = 'pending';
    }

    // Update payment record in Supabase
    const { data, error } = await supabase
      .from('payments')
      .update({
        status,
        stripe_payment_intent_id: session.payment_intent as string,
        metadata: {
          session_completed_at: new Date().toISOString(),
          payment_status: session.payment_status,
          stripe_status: session.status,
        },
      })
      .eq('stripe_session_id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating payment:', error);
      return NextResponse.json(
        { error: 'Failed to update payment status' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      status,
      payment: data 
    });
  } catch (error: any) {
    console.error('Error syncing payment status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync payment status' },
      { status: 500 }
    );
  }
}
