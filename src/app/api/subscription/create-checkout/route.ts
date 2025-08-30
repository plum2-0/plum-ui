import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { adminDb } from '@/lib/firebase-admin';
import { CheckoutSessionData } from '@/types/subscription';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId, successUrl, cancelUrl } = await request.json();

    if (!priceId || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const db = adminDb();
    const userDoc = await db
      .collection('users')
      .doc(session.user.id)
      .get();

    let stripeCustomerId = userDoc.data()?.stripeCustomerId;

    // Create Stripe customer if doesn't exist
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        metadata: {
          userId: session.user.id,
          brandId: session.brandId || '',
        },
      });
      
      stripeCustomerId = customer.id;
      
      // Update user with Stripe customer ID
      await db
        .collection('users')
        .doc(session.user.id)
        .update({
          stripeCustomerId,
          updatedAt: new Date(),
        });
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      metadata: {
        userId: session.user.id,
        brandId: session.brandId || '',
      },
      subscription_data: {
        metadata: {
          userId: session.user.id,
          brandId: session.brandId || '',
        },
      },
    });

    const response: CheckoutSessionData = {
      sessionId: checkoutSession.id,
      url: checkoutSession.url || '',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}