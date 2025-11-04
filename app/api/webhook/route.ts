import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';
import Stripe from 'stripe';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE!;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Update payment record to succeeded
        await supabase
          .from('payments')
          .update({
            status: 'succeeded',
            stripe_payment_intent_id: session.payment_intent as string,
            metadata: {
              session_completed_at: new Date().toISOString(),
              payment_status: session.payment_status,
            },
          })
          .eq('stripe_session_id', session.id);

        console.log('Payment succeeded:', session.id);
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Update payment record to canceled
        await supabase
          .from('payments')
          .update({
            status: 'canceled',
            metadata: {
              session_expired_at: new Date().toISOString(),
            },
          })
          .eq('stripe_session_id', session.id);

        console.log('Payment session expired:', session.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Update payment record to failed
        await supabase
          .from('payments')
          .update({
            status: 'failed',
            metadata: {
              failed_at: new Date().toISOString(),
              failure_message: paymentIntent.last_payment_error?.message,
            },
          })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        console.log('Payment failed:', paymentIntent.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error handling webhook:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
