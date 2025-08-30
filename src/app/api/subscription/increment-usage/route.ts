import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { SUBSCRIPTION_LIMITS } from '@/types/subscription';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = adminDb();
    const userRef = db.collection('users').doc(session.user.id);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    
    // Check if we need to reset the monthly counter
    const lastResetMonth = userData?.lastUsageReset ? 
      new Date(userData.lastUsageReset.toDate()).toISOString().slice(0, 7) : null;
    
    let updates: any = {
      lifetimeScrapeJobs: FieldValue.increment(1),
      updatedAt: Timestamp.now()
    };
    
    if (lastResetMonth !== currentMonth) {
      // Reset monthly counter
      updates.scrapeJobsThisMonth = 1;
      updates.lastUsageReset = Timestamp.now();
    } else {
      // Increment monthly counter
      updates.scrapeJobsThisMonth = FieldValue.increment(1);
    }
    
    // Check if user or any brand member has a subscription
    let effectiveSubscriptionTier = userData?.subscriptionTier || 'free';
    let brandHasActiveSubscription = false;
    
    // Get user's brand_id
    const userBrandId = userData?.brand_id;
    
    if (userBrandId && effectiveSubscriptionTier === 'free') {
      // Check if any brand member has a subscription
      const brandDoc = await db
        .collection('brands')
        .doc(userBrandId)
        .get();
      
      if (brandDoc.exists) {
        const brandData = brandDoc.data();
        const brandUserIds = brandData?.user_ids || [];
        
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
              effectiveSubscriptionTier = 'pro';
              break;
            }
          }
        }
      }
    }
    
    const monthlyLimit = (effectiveSubscriptionTier === 'pro' || brandHasActiveSubscription)
      ? SUBSCRIPTION_LIMITS.PRO_TIER_LIMIT 
      : SUBSCRIPTION_LIMITS.FREE_TIER_LIMIT;
    
    const currentUsage = lastResetMonth !== currentMonth ? 0 : (userData?.scrapeJobsThisMonth || 0);
    
    if (currentUsage >= monthlyLimit && !userData?.hasTesterAccess && !brandHasActiveSubscription) {
      return NextResponse.json(
        { error: 'Monthly limit exceeded', remainingJobs: 0 },
        { status: 403 }
      );
    }
    
    await userRef.update(updates);
    
    return NextResponse.json({
      success: true,
      remainingJobs: Math.max(0, monthlyLimit - (currentUsage + 1)),
      monthlyLimit
    });
  } catch (error) {
    console.error('Error incrementing usage:', error);
    return NextResponse.json(
      { error: 'Failed to increment usage' },
      { status: 500 }
    );
  }
}