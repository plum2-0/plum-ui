import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';
import { SUBSCRIPTION_LIMITS, SubscriptionStatus } from '@/types/subscription';
import { Timestamp } from 'firebase-admin/firestore';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = adminDb();
    const userDoc = await db
      .collection('users')
      .doc(session.user.id)
      .get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    
    // Check various access methods
    const now = Timestamp.now();
    const scrapeJobsThisMonth = userData?.scrapeJobsThisMonth || 0;
    
    // Get user's brand_id
    const userBrandId = userData?.brand_id;
    
    console.log('Subscription Check Debug:', {
      userId: session.user.id,
      brandId: userBrandId,
      scrapeJobsThisMonth,
      subscriptionStatus: userData?.subscriptionStatus,
      hasTesterAccess: userData?.hasTesterAccess,
      testerAccessExpiry: userData?.testerAccessExpiry?.toDate(),
    });
    
    // Check if user has active subscription
    const hasActiveSubscription = 
      userData?.subscriptionStatus === 'active' ||
      userData?.subscriptionStatus === 'trialing';
    
    // Check if user has valid tester access
    const hasTesterAccess = userData?.hasTesterAccess && 
      userData?.testerAccessExpiry && 
      userData.testerAccessExpiry.toMillis() > now.toMillis();
    
    // NEW: Check if any brand member has a subscription
    let brandHasActiveSubscription = false;
    let subscriptionTier = 'free';
    
    if (userBrandId) {
      // Get the brand document to find all user_ids
      const brandDoc = await db
        .collection('brands')
        .doc(userBrandId)
        .get();
      
      if (brandDoc.exists) {
        const brandData = brandDoc.data();
        const brandUserIds = brandData?.user_ids || [];
        
        console.log('Brand users:', brandUserIds);
        
        // Check if ANY user in the brand has an active subscription
        for (const brandUserId of brandUserIds) {
          const brandUserDoc = await db
            .collection('users')
            .doc(brandUserId)
            .get();
          
          if (brandUserDoc.exists) {
            const brandUserData = brandUserDoc.data();
            const userSubscriptionStatus = brandUserData?.subscriptionStatus;
            
            if (userSubscriptionStatus === 'active' || userSubscriptionStatus === 'trialing') {
              brandHasActiveSubscription = true;
              subscriptionTier = brandUserData?.subscriptionTier || 'pro';
              console.log(`Found paying user in brand: ${brandUserId} with status: ${userSubscriptionStatus}`);
              break; // Found at least one paying user, no need to check others
            }
          }
        }
      }
    }
    
    // Determine monthly limit based on whether brand has subscription
    const monthlyLimit = (brandHasActiveSubscription || hasActiveSubscription)
      ? SUBSCRIPTION_LIMITS.PRO_TIER_LIMIT 
      : SUBSCRIPTION_LIMITS.FREE_TIER_LIMIT;  // This is now 0
    
    // User has access if they have active subscription, valid tester access, or any brand member has subscription
    const hasAccess = 
      hasActiveSubscription ||
      hasTesterAccess ||
      brandHasActiveSubscription ||
      scrapeJobsThisMonth < monthlyLimit;  // This will always be false for free users now (0 < 0 = false)
    
    console.log('Access calculation:', {
      hasActiveSubscription,
      hasTesterAccess,
      brandHasActiveSubscription,
      monthlyLimit,
      scrapeJobsThisMonth,
      hasAccess,
    });

    const response: SubscriptionStatus = {
      hasAccess,
      subscriptionStatus: userData?.subscriptionStatus || 'none',
      remainingJobs: Math.max(0, monthlyLimit - scrapeJobsThisMonth),
      monthlyLimit,
      hasTesterAccess: hasTesterAccess || false
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error checking subscription:', error);
    return NextResponse.json(
      { error: 'Failed to check subscription status' },
      { status: 500 }
    );
  }
}