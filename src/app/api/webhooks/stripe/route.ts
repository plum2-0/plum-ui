import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const db = adminDb();
  const customerId = subscription.customer as string;
  
  // Find user by Stripe customer ID
  const usersSnapshot = await db
    .collection('users')
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get();
  
  if (usersSnapshot.empty) {
    console.error(`User not found for customer ${customerId}`);
    return;
  }
  
  const userDoc = usersSnapshot.docs[0];
  const userId = userDoc.id;
  
  // Map Stripe status to our subscription tier
  const isActive = subscription.status === 'active' || subscription.status === 'trialing';
  const subscriptionTier = isActive ? 'pro' : 'free';
  
  // Update user document
  await db.collection('users').doc(userId).update({
    subscriptionStatus: subscription.status,
    subscriptionId: subscription.id,
    subscriptionTier,
    subscriptionEndDate: (subscription as any).current_period_end 
      ? Timestamp.fromMillis((subscription as any).current_period_end * 1000) 
      : null,
    updatedAt: Timestamp.now()
  });
  
  console.log(`Updated subscription for user ${userId}: ${subscription.status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const db = adminDb();
  const customerId = subscription.customer as string;
  
  // Find user by Stripe customer ID
  const usersSnapshot = await db
    .collection('users')
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get();
  
  if (usersSnapshot.empty) {
    console.error(`User not found for customer ${customerId}`);
    return;
  }
  
  const userDoc = usersSnapshot.docs[0];
  const userId = userDoc.id;
  
  // Update user to free tier
  await db.collection('users').doc(userId).update({
    subscriptionStatus: 'canceled',
    subscriptionTier: 'free',
    subscriptionId: null,
    subscriptionEndDate: null,
    updatedAt: Timestamp.now()
  });
  
  console.log(`Subscription canceled for user ${userId}`);
}

async function handleSuccessfulPayment(invoice: Stripe.Invoice) {
  const db = adminDb();
  const customerId = invoice.customer as string;
  
  // Find user by Stripe customer ID
  const usersSnapshot = await db
    .collection('users')
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get();
  
  if (usersSnapshot.empty) {
    console.error(`User not found for customer ${customerId}`);
    return;
  }
  
  const userDoc = usersSnapshot.docs[0];
  const userId = userDoc.id;
  const userData = userDoc.data();
  
  // Update payment metadata
  const updates: any = {
    totalRevenue: (userData?.totalRevenue || 0) + (invoice.amount_paid / 100),
    updatedAt: Timestamp.now()
  };
  
  // Set first payment date if not set
  if (!userData?.firstPaymentDate) {
    updates.firstPaymentDate = Timestamp.now();
  }
  
  await db.collection('users').doc(userId).update(updates);
  
  console.log(`Payment processed for user ${userId}: $${invoice.amount_paid / 100}`);
}

async function handleFailedPayment(invoice: Stripe.Invoice) {
  const db = adminDb();
  const customerId = invoice.customer as string;
  
  // Find user by Stripe customer ID
  const usersSnapshot = await db
    .collection('users')
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get();
  
  if (usersSnapshot.empty) {
    console.error(`User not found for customer ${customerId}`);
    return;
  }
  
  const userDoc = usersSnapshot.docs[0];
  const userId = userDoc.id;
  
  // Update subscription status to past_due
  await db.collection('users').doc(userId).update({
    subscriptionStatus: 'past_due',
    updatedAt: Timestamp.now()
  });
  
  console.log(`Payment failed for user ${userId}`);
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');
  
  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }
  
  let event: Stripe.Event;
  
  try {
    // In development, if webhook secret verification fails with the configured secret,
    // try to construct the event without verification for stripe CLI testing
    if (process.env.NODE_ENV === 'development' && webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(
          body,
          signature,
          webhookSecret
        );
      } catch (devErr) {
        // If verification fails in dev, parse the event directly for testing
        console.warn('Webhook signature verification failed in dev, parsing event directly for testing');
        event = JSON.parse(body) as Stripe.Event;
      }
    } else {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }
  
  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        // Important for Basil: subscriptions are created after checkout completion
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        if (checkoutSession.mode === 'subscription' && checkoutSession.subscription) {
          // Subscription will be handled by the subscription.created event
          console.log(`Checkout completed for subscription: ${checkoutSession.subscription}`);
        }
        break;
        
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
        
      case 'invoice.payment_succeeded':
        await handleSuccessfulPayment(event.data.object as Stripe.Invoice);
        break;
        
      case 'invoice.payment_failed':
        await handleFailedPayment(event.data.object as Stripe.Invoice);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}